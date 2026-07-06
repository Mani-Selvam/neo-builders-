import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate, checkCompanyStatus } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate, checkCompanyStatus);
router.get('/stats', dashboardController.getStats);

export default router;
