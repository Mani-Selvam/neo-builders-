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

    let user;
    let role;
    if (payload.isEmployee) {
      const { Employee } = await import('../models/masters/index.js');
      user = await Employee.findById(payload.userId);
      if (!user || user.status !== 'Active') {
        console.log('[authenticate] Employee not found or inactive', payload.userId);
        return failure(res, { message: 'Account is not active', statusCode: 401 });
      }
    } else {
      user = await User.findById(payload.userId);
      if (!user || user.status !== 'Active') {
        console.log('[authenticate] User not found or inactive', payload.userId);
        return failure(res, { message: 'Account is not active', statusCode: 401 });
      }
      role = await Role.findById(user.roleId);
    }

    const company = await Company.findById(user.companyId || payload.companyId);
    if (!company) {
      console.log('[authenticate] Company not found', user.companyId);
      return failure(res, { message: 'Company not found', statusCode: 401 });
    }
    if (company.status !== 'Active') {
      console.log('[authenticate] Company inactive');
      return failure(res, { message: `Company account is ${company.status.toLowerCase()}. Please contact support.`, statusCode: 401 });
    }

    req.user = {
      userId: user._id.toString(),
      companyId: company._id.toString(),
      name: user.name || user.empName,
      email: user.email || user.emailId,
      isOwner: user.isOwner || false,
      isEmployee: !!payload.isEmployee,
      siteTypeIds: user.siteTypeIds || [],
      siteIds: user.siteIds || [],
      roleId: user.roleId?.toString(),
      roleName: role?.name || 'Employee',
      permissions: role ? Object.fromEntries(role.permissions) : {},
    };
    req.company = company;

    next();
  } catch (err) {
    console.log('[authenticate] Error:', err);
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
    
    // Employee explicit permissions
    if (req.user?.isEmployee) {
      if (['materialRequests', 'sites', 'siteTypes'].includes(module)) {
        return next();
      }
      return failure(res, {
        message: `Employees do not have permission to access ${module}`,
        statusCode: 403,
      });
    }

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
