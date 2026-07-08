import { Employee, Client, Supplier, Labourer, Item, Truck, Site } from '../models/masters/index.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Company from '../models/Company.js';
import { success } from '../utils/apiResponse.js';

export async function getStats(req, res, next) {
  try {
    const companyId = req.user.companyId;
    const [
      totalEmployees, activeSites, totalClients, totalSuppliers,
      totalLabourers, totalItems, totalTrucks, activeUsers,
    ] = await Promise.all([
      Employee.countDocuments({ companyId }),
      Site.countDocuments({ companyId, status: 'Active' }),
      Client.countDocuments({ companyId }),
      Supplier.countDocuments({ companyId }),
      Labourer.countDocuments({ companyId }),
      Item.countDocuments({ companyId }),
      Truck.countDocuments({ companyId }),
      User.countDocuments({ companyId, status: 'Active' }),
    ]);

    const company = await Company.findById(companyId);

    return success(res, {
      data: {
        stats: {
          totalEmployees, activeSites, totalClients, totalSuppliers,
          totalLabourers, totalItems, totalTrucks, activeUsers,
        },
        company: {
          profileCompletionPercentage: company.profileCompletionPercentage,
          profileCompleted: company.profileCompleted,
          profilePromptDismissed: company.profilePromptDismissed,
          subscriptionPlanName: company.subscriptionPlanName,
          subscriptionExpiryDate: company.subscriptionExpiryDate,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
