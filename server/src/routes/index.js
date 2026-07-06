import { Router } from 'express';
import authRoutes from './authRoutes.js';
import companyRoutes from './companyRoutes.js';
import masterRoutes from './masterRoutes.js';
import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/', masterRoutes);

export default router;
