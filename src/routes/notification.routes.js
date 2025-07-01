const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get(
  '/notifications',
  authMiddleware.authenticate,
  notificationController.getNotifications
);

router.patch(
  '/notifications/:id/read',
  authMiddleware.authenticate,
  notificationController.markAsRead
);

module.exports = router;