import AuditLog from '../models/AuditLog.js';
import { success } from '../utils/apiResponse.js';

export async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, module: moduleFilter, action } = req.query;
    const query = { companyId: req.user.companyId };
    if (moduleFilter) query.module = moduleFilter;
    if (action) query.action = action;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    return success(res, {
      data: logs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
    });
  } catch (err) {
    next(err);
  }
}
