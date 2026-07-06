import Company from '../models/Company.js';
import AuditLog from '../models/AuditLog.js';
import { success, failure } from '../utils/apiResponse.js';

const EDITABLE_FIELDS = [
  'companyName', 'gstNo', 'panNo', 'registrationNo', 'contactPerson', 'mobileNo',
  'email', 'address', 'city', 'state', 'country', 'pincode', 'logo',
];

export async function getProfile(req, res, next) {
  try {
    const company = await Company.findById(req.user.companyId);
    return success(res, { data: company });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const company = await Company.findById(req.user.companyId);
    const before = company.toObject();

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        company[field] = req.body[field];
      }
    }
    company.recalculateProfileCompletion();
    await company.save();

    await AuditLog.create({
      companyId: company._id,
      userId: req.user.userId,
      userName: req.user.name,
      module: 'company',
      action: 'update_profile',
      entityId: company._id,
      oldData: before,
      newData: company.toObject(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    return success(res, { message: 'Company profile updated successfully', data: company });
  } catch (err) {
    next(err);
  }
}

export async function dismissProfilePrompt(req, res, next) {
  try {
    const company = await Company.findById(req.user.companyId);
    company.profilePromptDismissed = true;
    await company.save();
    return success(res, { message: 'Preference saved', data: company });
  } catch (err) {
    next(err);
  }
}
