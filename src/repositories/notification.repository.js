const { query } = require('../utils/db');
const BaseRepository = require('./base.repository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications', Notification);
  }

  async create(notificationData) {
    const result = await query(
      `INSERT INTO notifications 
       (user_id, sender_id, post_id, comment_id, type)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        notificationData.userId,
        notificationData.senderId,
        notificationData.postId,
        notificationData.commentId,
        notificationData.type
      ]
    );
    return new Notification(result.rows[0]);
  }

  async findByUserId(userId, { limit = 10, offset = 0 }) {
    const result = await query(
      `SELECT *
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows.map(row => new Notification(row));
  }

  async getUnreadCount(userId) {
    const result = await query(
      `SELECT COUNT(*) FROM notifications 
       WHERE user_id = $1 AND read = false`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async update(id, updateData) {
    const result = await query(
      `UPDATE notifications SET 
       read = $1,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [updateData.read, id]
    );
    return result.rows.length ? new Notification(result.rows[0]) : null;
  }
}

module.exports = new NotificationRepository();