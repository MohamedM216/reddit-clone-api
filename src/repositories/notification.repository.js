const { query } = require('../utils/db');
const Notification = require('../models/Notification');

class NotificationRepository {
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
      `SELECT n.*, 
              u.username as sender_username,
              p.title as post_title,
              c.content as comment_preview
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       LEFT JOIN posts p ON n.post_id = p.id
       LEFT JOIN comments c ON n.comment_id = c.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
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