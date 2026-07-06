import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as companyController from '../controllers/companyController.js';
import { authenticate, checkCompanyStatus, authorize } from '../middleware/authenticate.js';
import { stripTenantFields } from '../middleware/validateRequest.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const router = Router();

router.use(authenticate, checkCompanyStatus);

router.get('/profile', companyController.getProfile);
router.put('/profile', authorize('company', 'edit'), stripTenantFields, companyController.updateProfile);
router.post('/profile/logo', authorize('company', 'edit'), upload.single('logo'), companyController.uploadLogo);
router.post('/profile/dismiss-prompt', companyController.dismissProfilePrompt);

export default router;
