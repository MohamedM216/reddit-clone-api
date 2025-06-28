const BaseRepository = require('./base.repository');
const Comment = require('../models/Comment');

class CommentRepository extends BaseRepository {
  constructor() {
    super('comments', Comment);
  }

  async findByPostId(postId, { limit = 10, offset = 0 }) {
    const result = await this.query(
      `SELECT * FROM comments 
       WHERE post_id = $1 AND parent_id IS NULL
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );
    return result.rows.map(row => new this.modelClass(row));
  }

  async findByParentId(parentId, { limit = 10, offset = 0 }) {
    const result = await this.query(
      `SELECT * FROM comments 
       WHERE parent_id = $1
       ORDER BY created_at ASC 
       LIMIT $2 OFFSET $3`,
      [parentId, limit, offset]
    );
    return result.rows.map(row => new this.modelClass(row));
  }

  async getTotalCountByPostId(postId) {
    const result = await this.query(
      'SELECT COUNT(*) FROM comments WHERE post_id = $1 AND parent_id IS NULL',
      [postId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async getTotalCountByParentId(parentId) {
    const result = await this.query(
      'SELECT COUNT(*) FROM comments WHERE parent_id = $1',
      [parentId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async getCommentWithAuthor(commentId) {
    const result = await this.query(
      `SELECT c.*, u.username, u.karma as user_karma
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [commentId]
    );
    return result.rows.length ? new this.modelClass(result.rows[0]) : null;
  }
}

module.exports = new CommentRepository();