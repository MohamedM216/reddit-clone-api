const notificationService = require('../services/notification.service');
const { io } = require('../utils/socket');

module.exports = function setupNotificationHandlers() {
  io.on('connection', (socket) => {
    socket.on('notification:markRead', async (notificationId, userId) => {
      try {
        await notificationService.markAsRead(notificationId, userId);
        socket.emit('notification:markedRead', { success: true });
      } catch (error) {
        socket.emit('notification:error', { error: error.message });
      }
    });
  });
};