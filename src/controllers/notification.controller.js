const notificationService = require('../services/notification.service');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const result = await notificationService.getUserNotifications(req.user.id, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user.id
      );
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();