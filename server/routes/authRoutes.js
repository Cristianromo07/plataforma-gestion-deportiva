const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate, registerRules, loginRules } = require('../middleware/validators');

router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/logout', authController.logout);
router.get('/user-info', authController.getUserInfo);

module.exports = router;
