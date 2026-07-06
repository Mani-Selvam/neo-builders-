import Role from '../models/Role.js';
import User from '../models/User.js';
import { success, ApiError } from '../utils/apiResponse.js';
import { MODULES, ACTIONS } from '../config/permissions.js';

export async function list(req, res, next) {
  try {
    const roles = await Role.find({ companyId: req.user.companyId }).sort('name');
    return success(res, { data: roles, meta: { modules: MODULES, actions: ACTIONS } });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const role = await Role.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!role) throw new ApiError(404, 'Role not found');
    return success(res, { data: role });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { name, permissions } = req.body;
    const role = await Role.create({ companyId: req.user.companyId, name, permissions: permissions || {} });
    return success(res, { message: 'Role created successfully', statusCode: 201, data: role });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { name, permissions, status } = req.body;
    const role = await Role.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!role) throw new ApiError(404, 'Role not found');
    if (role.isSystem && name) throw new ApiError(403, 'System role name cannot be changed');

    if (name && !role.isSystem) role.name = name;
    if (permissions) role.permissions = permissions;
    if (status) role.status = status;
    await role.save();

    return success(res, { message: 'Role updated successfully', data: role });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const role = await Role.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!role) throw new ApiError(404, 'Role not found');
    if (role.isSystem) throw new ApiError(403, 'System roles cannot be deleted');

    const usersWithRole = await User.countDocuments({ roleId: role._id });
    if (usersWithRole > 0) throw new ApiError(409, 'Cannot delete a role assigned to users');

    await Role.deleteOne({ _id: role._id });
    return success(res, { message: 'Role deleted successfully' });
  } catch (err) {
    next(err);
  }
}
