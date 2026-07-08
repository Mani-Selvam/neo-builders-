import Company from '../models/Company.js';
import User from '../models/User.js';
import { success, failure } from '../utils/apiResponse.js';

export async function getDashboardStats(req, res, next) {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalUsers = await User.countDocuments();
    const completedProfiles = await Company.countDocuments({ profileCompleted: true });
    const pendingProfiles = await Company.countDocuments({ profileCompleted: false });

    // Latest 5 registered companies for a quick dashboard preview
    const recentCompanies = await Company.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentCompanyIds = recentCompanies.map(c => c._id);
    // Find users matching recent company IDs
    const recentUsers = await User.find({ companyId: { $in: recentCompanyIds } }).lean();

    const recentData = recentCompanies.map(c => {
      // Safe check to verify companyId exists of the user before converting copy to string
      const companyUsers = recentUsers.filter(u => u.companyId && u.companyId.toString() === c._id.toString());
      const owner = companyUsers.find(u => u.isOwner) || companyUsers[0] || null;
      return {
        ...c,
        ownerName: owner ? owner.name : c.contactPerson,
        ownerEmail: owner ? owner.email : c.email,
        ownerMobile: owner ? owner.mobileNo : c.mobileNo,
      };
    });

    return success(res, {
      data: {
        stats: {
          totalCompanies,
          totalUsers,
          completedProfiles,
          pendingProfiles,
        },
        recentCompanies: recentData,
      },
    });
  } catch (err) {
    console.error('[superadmin-api] Error fetching dashboard stats:', err);
    next(err);
  }
}

export async function getCompaniesList(req, res, next) {
  try {
    const companies = await Company.find().sort({ createdAt: -1 }).lean();
    const companyIds = companies.map(c => c._id);

    // Fetch all users linked to these companies
    const allUsers = await User.find({ companyId: { $in: companyIds } }).lean();

    const groupedData = companies.map(company => {
      // Safe check ensuring u.companyId is defined before calling .toString()
      const companyUsers = allUsers.filter(u => u.companyId && u.companyId.toString() === company._id.toString());
      const owner = companyUsers.find(u => u.isOwner) || companyUsers[0] || null;

      return {
        ...company,
        users: companyUsers.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          mobileNo: u.mobileNo,
          status: u.status,
          isOwner: u.isOwner,
          createdAt: u.createdAt,
        })),
        owner: owner ? {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          mobileNo: owner.mobileNo,
          status: owner.status,
        } : null,
      };
    });

    return success(res, {
      data: groupedData,
    });
  } catch (err) {
    console.error('[superadmin-api] Error fetching companies list:', err);
    next(err);
  }
}

export async function toggleCompanyStatus(req, res, next) {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return failure(res, { message: 'Company not found', statusCode: 404 });
    }

    const newStatus = company.status === 'Active' ? 'Inactive' : 'Active';
    company.status = newStatus;
    await company.save();

    console.log(`[superadmin-api] Company ${company.companyName} (${id}) status toggled to: ${newStatus}`);

    return success(res, {
      message: `Company status changed to ${newStatus}`,
      data: { id: company._id, status: company.status }
    });
  } catch (err) {
    console.error('[superadmin-api] Error toggling company status:', err);
    next(err);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return failure(res, { message: 'No file uploaded', statusCode: 400 });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return success(res, {
      message: 'Avatar uploaded successfully',
      data: { url: fileUrl }
    });
  } catch (err) {
    console.error('[superadmin-api] Error uploading avatar:', err);
    next(err);
  }
}
