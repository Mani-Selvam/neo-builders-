import { Router } from 'express';
import * as auditLogController from '../controllers/auditLogController.js';
import { authenticate, checkCompanyStatus, authorize } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate, checkCompanyStatus);
router.get('/', authorize('auditLogs', 'view'), auditLogController.list);

export default router;
