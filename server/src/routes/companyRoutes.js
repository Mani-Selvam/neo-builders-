import { Router } from 'express';
import * as companyController from '../controllers/companyController.js';
import { authenticate, checkCompanyStatus, authorize } from '../middleware/authenticate.js';
import { stripTenantFields } from '../middleware/validateRequest.js';

const router = Router();

router.use(authenticate, checkCompanyStatus);

router.get('/profile', companyController.getProfile);
router.put('/profile', authorize('company', 'edit'), stripTenantFields, companyController.updateProfile);
router.post('/profile/dismiss-prompt', companyController.dismissProfilePrompt);

export default router;
