const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { basicLimiter, strictLimiter } = require('../middlewares/rateLimiter');

// Public routes
router.post('/register', strictLimiter, authController.register);
router.post('/login', strictLimiter, authController.login);
router.get('/verify-email', strictLimiter, authController.verifyEmail);
router.post('/request-password-reset', strictLimiter, authController.requestPasswordReset);
router.post('/reset-password', strictLimiter, authController.resetPassword);

// Protected routes
router.get('/me', 
  basicLimiter,
  authMiddleware.authenticate, 
  authController.getCurrentUser
);

module.exports = router;