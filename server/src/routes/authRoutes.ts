import express from 'express';
import * as authController from '../controllers/authController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/check-session', authController.checkSession);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
