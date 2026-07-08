import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema,
} from '../validators/authValidators.js';

const router = Router();

router.post('/signup', authRateLimiter, validateRequest(signupSchema), authController.signup);
router.get('/check-email', authRateLimiter, authController.checkEmail);
router.post('/login', authRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authRateLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), authController.changePassword);

export default router;
