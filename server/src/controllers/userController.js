import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Role from '../models/Role.js';
import AuditLog from '../models/AuditLog.js';
import { success, ApiError } from '../utils/apiResponse.js';

export async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, search = '', status } = req.query;
    const query = { companyId: req.user.companyId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);

    const [users, total] = await Promise.all([
      User.find(query).populate('roleId', 'name').sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
      User.countDocuments(query),
    ]);

    return success(res, {
      data: users,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, companyId: req.user.companyId }).populate('roleId', 'name');
    if (!user) throw new ApiError(404, 'User not found');
    return success(res, { data: user });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { name, email, mobileNo, password, roleId } = req.body;
    if (!password || password.length < 6) {
      throw new ApiError(422, 'Password must be at least 6 characters', { password: 'Too short' });
    }

    const role = await Role.findOne({ _id: roleId, companyId: req.user.companyId });
    if (!role) throw new ApiError(422, 'Invalid role selected', { roleId: 'Role not found for this company' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      companyId: req.user.companyId,
      name,
      email: email.toLowerCase(),
      mobileNo: mobileNo || '',
      passwordHash,
      roleId,
    });

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user.userId,
      userName: req.user.name,
      module: 'users',
      action: 'create',
      entityId: user._id,
      newData: { name, email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    const sanitized = user.toObject();
    delete sanitized.passwordHash;
    return success(res, { message: 'User created successfully', statusCode: 201, data: sanitized });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { name, email, mobileNo, roleId, status, password } = req.body;
    const user = await User.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!user) throw new ApiError(404, 'User not found');

    if (roleId) {
      const role = await Role.findOne({ _id: roleId, companyId: req.user.companyId });
      if (!role) throw new ApiError(422, 'Invalid role selected', { roleId: 'Role not found for this company' });
      user.roleId = roleId;
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (mobileNo !== undefined) user.mobileNo = mobileNo;
    if (status && !user.isOwner) user.status = status;
    if (password) {
      if (password.length < 6) throw new ApiError(422, 'Password must be at least 6 characters');
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user.userId,
      userName: req.user.name,
      module: 'users',
      action: 'update',
      entityId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    const sanitized = user.toObject();
    delete sanitized.passwordHash;
    return success(res, { message: 'User updated successfully', data: sanitized });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!user) throw new ApiError(404, 'User not found');
    if (user.isOwner) throw new ApiError(403, 'The company owner account cannot be deleted');

    await User.deleteOne({ _id: user._id });

    await AuditLog.create({
      companyId: req.user.companyId,
      userId: req.user.userId,
      userName: req.user.name,
      module: 'users',
      action: 'delete',
      entityId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    return success(res, { message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
}
