import bcrypt from 'bcryptjs';
import Company from './models/Company.js';
import User from './models/User.js';
import Role from './models/Role.js';
import { DEFAULT_ROLES } from './config/permissions.js';
import { generateCompanyCode } from './utils/companyCode.js';

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'maniselvam2023@gmail.com',
  password: 'mani123',
};

export async function ensureDefaultAdminUser() {
  const normalizedEmail = DEFAULT_ADMIN_CREDENTIALS.email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (existingUser) {
    if (existingUser.status !== 'Active') {
      existingUser.status = 'Active';
    }

    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_CREDENTIALS.password, 10);
    if (!existingUser.passwordHash || existingUser.passwordHash !== passwordHash) {
      existingUser.passwordHash = passwordHash;
    }

    await existingUser.save();
    console.log(`[bootstrap] Ensured default admin account exists for ${normalizedEmail}`);
    return existingUser;
  }

  const companyCode = await generateCompanyCode();
  const company = await Company.create({
    companyCode,
    companyName: 'Apex Builders Ltd.',
    contactPerson: 'Mani Selvam',
    mobileNo: '9876543210',
    email: normalizedEmail,
    country: 'India',
    status: 'Active',
    profileCompleted: true,
    profileCompletionPercentage: 100,
  });
  company.recalculateProfileCompletion();
  await company.save();

  const roleDocs = await Role.insertMany(
    DEFAULT_ROLES.map((role) => ({
      companyId: company._id,
      name: role.name,
      isSystem: role.isSystem,
      permissions: role.permissions,
    }))
  );
  const adminRole = roleDocs.find((role) => role.name === 'Company Admin');

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_CREDENTIALS.password, 10);
  const user = await User.create({
    companyId: company._id,
    name: 'Mani Selvam',
    email: normalizedEmail,
    mobileNo: '9876543210',
    passwordHash,
    roleId: adminRole._id,
    isOwner: true,
    status: 'Active',
  });

  console.log(`[bootstrap] Created default admin account for ${normalizedEmail}`);
  return user;
}
