import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import RefreshToken from '../models/RefreshToken.js';
import AuditLog from '../models/AuditLog.js';
import { generateCompanyCode } from '../utils/companyCode.js';
import { DEFAULT_ROLES } from '../config/permissions.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { success, failure, ApiError } from '../utils/apiResponse.js';

const REFRESH_COOKIE_NAME = 'refreshToken';
const isProd = process.env.NODE_ENV === 'production';

function setRefreshCookie(res, token, maxAgeMs) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/api/v1/auth',
  });
}

async function issueTokens(res, user, req) {
  const accessToken = signAccessToken({ userId: user._id.toString(), companyId: user.companyId.toString() });
  const refreshToken = signRefreshToken({ userId: user._id.toString(), companyId: user.companyId.toString() });

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await RefreshToken.create({
    userId: user._id,
    companyId: user.companyId,
    token: refreshToken,
    expiresAt,
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip,
  });

  setRefreshCookie(res, refreshToken, 1000 * 60 * 60 * 24 * 30);
  return accessToken;
}

function sanitizeUser(user, company, role) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobileNo: user.mobileNo,
    isOwner: user.isOwner,
    status: user.status,
    role: role ? { id: role._id, name: role.name, permissions: Object.fromEntries(role.permissions) } : null,
    company: {
      id: company._id,
      companyCode: company.companyCode,
      companyName: company.companyName,
      status: company.status,
      profileCompleted: company.profileCompleted,
      profileCompletionPercentage: company.profileCompletionPercentage,
      profilePromptDismissed: company.profilePromptDismissed,
      subscriptionPlanName: company.subscriptionPlanName,
      subscriptionExpiryDate: company.subscriptionExpiryDate,
      logo: company.logo,
    },
  };
}

export async function signup(req, res, next) {
  try {
    const { companyName, contactPerson, mobileNo, email, password, country } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const companyCode = await generateCompanyCode();
    const company = await Company.create({
      companyCode,
      companyName,
      contactPerson,
      mobileNo,
      email: email.toLowerCase(),
      country: country || '',
    });
    company.recalculateProfileCompletion();
    await company.save();

    const roleDocs = await Role.insertMany(
      DEFAULT_ROLES.map((r) => ({ companyId: company._id, name: r.name, isSystem: r.isSystem, permissions: r.permissions }))
    );
    const adminRole = roleDocs.find((r) => r.name === 'Company Admin');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      companyId: company._id,
      name: contactPerson,
      email: email.toLowerCase(),
      mobileNo,
      passwordHash,
      roleId: adminRole._id,
      isOwner: true,
    });

    await AuditLog.create({
      companyId: company._id,
      userId: user._id,
      userName: user.name,
      module: 'auth',
      action: 'signup',
      entityId: company._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    const accessToken = await issueTokens(res, user, req);
    return success(res, {
      message: 'Company account created successfully',
      statusCode: 201,
      data: { accessToken, user: sanitizeUser(user, company, adminRole) },
    });
  } catch (err) {
    next(err);
  }
}

export async function checkEmail(req, res, next) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email parameter is required' });
    }
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    return res.status(200).json({
      success: true,
      message: 'Email check complete',
      data: { exists: !!existing },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status !== 'Active') {
      throw new ApiError(403, `Your account is ${user.status.toLowerCase()}. Contact your administrator.`);
    }

    const company = await Company.findById(user.companyId);
    if (!company || company.status !== 'Active') {
      throw new ApiError(403, `Company account is ${company?.status?.toLowerCase() || 'inactive'}`);
    }

    const role = await Role.findById(user.roleId);

    user.lastLoginAt = new Date();
    await user.save();

    await AuditLog.create({
      companyId: company._id,
      userId: user._id,
      userName: user.name,
      module: 'auth',
      action: 'login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    const accessToken = await issueTokens(res, user, req);
    return success(res, {
      message: 'Login successful',
      data: { accessToken, user: sanitizeUser(user, company, role) },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      throw new ApiError(401, 'No refresh token provided');
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const stored = await RefreshToken.findOne({ token, revoked: false });
    if (!stored || stored.expiresAt < new Date()) {
      throw new ApiError(401, 'Refresh session expired, please login again');
    }

    const user = await User.findById(payload.userId);
    if (!user || user.status !== 'Active') {
      throw new ApiError(401, 'Account not active');
    }

    const company = await Company.findById(user.companyId);
    if (!company || company.status !== 'Active') {
      throw new ApiError(401, 'Company account is inactive or deactivated');
    }
    const role = await Role.findById(user.roleId);

    const accessToken = signAccessToken({ userId: user._id.toString(), companyId: user.companyId.toString() });

    return success(res, {
      message: 'Token refreshed',
      data: { accessToken, user: sanitizeUser(user, company, role) },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      await RefreshToken.updateOne({ token }, { revoked: true });
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    return success(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30);
      await user.save();

      console.log(`[auth] Password reset requested for ${user.email}. Reset token (dev only): ${rawToken}`);
    }

    return success(res, {
      message: 'If an account with that email exists, a password reset link has been generated. Check server logs (email delivery is not configured yet).',
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new ApiError(400, 'Reset token is invalid or has expired');
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return success(res, { message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    const company = await Company.findById(req.user.companyId);
    const role = await Role.findById(req.user.roleId);
    return success(res, { data: sanitizeUser(user, company, role) });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId).select('+passwordHash');
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      throw new ApiError(400, 'Current password is incorrect');
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return success(res, { message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}
