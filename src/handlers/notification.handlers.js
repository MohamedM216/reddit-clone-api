class NotificationHandlers {
  constructor(io) {
    this.io = io;
    this.setupHandlers();
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('notification:markRead', this.handleMarkRead.bind(this, socket));
    });
  }

  async handleMarkRead(socket, notificationId, userId) {
    try {
      await notificationService.markAsRead(notificationId, userId);
      socket.emit('notification:markedRead', { success: true });
    } catch (error) {
      socket.emit('notification:error', { error: error.message });
    }
  }
}

module.exports = NotificationHandlers;