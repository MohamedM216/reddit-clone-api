const notificationRepository = require('../repositories/notification.repository');

class NotificationService {
  async createNotification(notificationData) {
    return notificationRepository.create(notificationData);
  }

  async getUserNotifications(userId, { limit = 10, offset = 0 }) {
    const [notifications, total] = await Promise.all([
      notificationRepository.findByUserId(userId, { limit, offset }),
      notificationRepository.getUnreadCount(userId)
    ]);

    return {
      data: notifications,
      meta: {
        total,
        unread: total,
        limit,
        offset
      }
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found or unauthorized');
    }
    return notificationRepository.update(notificationId, { read: true });
  }
}

module.exports = new NotificationService();