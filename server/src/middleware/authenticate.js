import { verifyAccessToken } from '../utils/jwt.js';
import { failure } from '../utils/apiResponse.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Company from '../models/Company.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return failure(res, { message: 'Authentication required', statusCode: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      return failure(res, { message: 'Invalid or expired token', statusCode: 401 });
    }

    const user = await User.findById(payload.userId);
    if (!user || user.status !== 'Active') {
      return failure(res, { message: 'Account is not active', statusCode: 401 });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return failure(res, { message: 'Company not found', statusCode: 401 });
    }
    if (company.status !== 'Active') {
      return failure(res, { message: `Company account is ${company.status.toLowerCase()}. Please contact support.`, statusCode: 401 });
    }

    const role = await Role.findById(user.roleId);

    req.user = {
      userId: user._id.toString(),
      companyId: user.companyId.toString(),
      name: user.name,
      email: user.email,
      isOwner: user.isOwner,
      roleId: user.roleId?.toString(),
      roleName: role?.name || '',
      permissions: role ? Object.fromEntries(role.permissions) : {},
    };
    req.company = company;

    next();
  } catch (err) {
    next(err);
  }
}

export function checkCompanyStatus(req, res, next) {
  if (!req.company) {
    return failure(res, { message: 'Company context missing', statusCode: 401 });
  }
  if (req.company.status !== 'Active') {
    return failure(res, { message: `Company account is ${req.company.status.toLowerCase()}`, statusCode: 403 });
  }
  next();
}

export function checkSubscription(req, res, next) {
  if (!req.company) {
    return failure(res, { message: 'Company context missing', statusCode: 401 });
  }
  if (req.company.subscriptionExpiryDate && new Date(req.company.subscriptionExpiryDate) < new Date()) {
    return failure(res, { message: 'Subscription has expired', statusCode: 403 });
  }
  next();
}

export function authorize(module, action = 'view') {
  return (req, res, next) => {
    if (req.user?.isOwner) return next();
    const modulePerms = req.user?.permissions?.[module];
    if (!modulePerms || !modulePerms[action]) {
      return failure(res, {
        message: `You do not have permission to ${action} ${module}`,
        statusCode: 403,
      });
    }
    next();
  };
}
