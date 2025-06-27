const BaseRepository = require('./base.repository');
const Post = require('../models/Post');

class PostRepository extends BaseRepository {
  constructor() {
    super('posts', Post);
  }

  async findByUserId(userId, { limit = 10, offset = 0 }) {
    const result = await this.query(
      `SELECT * FROM posts 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows.map(row => new this.modelClass(row));
  }

  async searchPosts(query, { limit = 10, offset = 0 }) {
    const result = await this.query(
      `SELECT * FROM posts 
       WHERE to_tsvector('english', title || ' ' || content) @@ to_tsquery('english', $1)
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [query + ':*', limit, offset]
    );
    return result.rows.map(row => new this.modelClass(row));
  }

  async getTotalCountByUserId(userId) {
    const result = await this.query(
      'SELECT COUNT(*) FROM posts WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async getTotalSearchCount(query) {
    const result = await this.query(
      `SELECT COUNT(*) FROM posts 
       WHERE to_tsvector('english', title || ' ' || content) @@ to_tsquery('english', $1)`,
      [query + ':*']
    );
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = new PostRepository();