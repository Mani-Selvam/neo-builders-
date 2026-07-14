import { Router } from 'express';
import * as employeeAuthController from '../controllers/employeeAuthController.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authRateLimiter, employeeAuthController.login);
router.post('/forgot-password', authRateLimiter, employeeAuthController.forgotPassword);
router.post('/verify-otp', authRateLimiter, employeeAuthController.verifyOtp);
router.post('/reset-password', authRateLimiter, employeeAuthController.resetPassword);

export default router;
