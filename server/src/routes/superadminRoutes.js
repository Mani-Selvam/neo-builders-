import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as superadminController from '../controllers/superadminController.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const router = Router();

// For local/mock UI integration, we'll keep these open for simplicity, 
// but fully populated from our database.
router.get('/dashboard-stats', superadminController.getDashboardStats);
router.get('/companies', superadminController.getCompaniesList);
router.put('/companies/:id/toggle-status', superadminController.toggleCompanyStatus);
router.post('/upload-avatar', upload.single('avatar'), superadminController.uploadAvatar);

export default router;
