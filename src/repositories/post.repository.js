const { query } = require('../utils/db');
const BaseRepository = require('./base.repository');
const Post = require('../models/Post');
const { storePostLinks } = require('../utils/linkExtractor');

class PostRepository extends BaseRepository {
  constructor() {
    super('posts', Post);
  }

  async create(data) {
    const result = await super.create(data);
    
    if (data.content) {
      await storePostLinks(result.id, data.content);
    }
    
    return result;
  }

  async findById(id) {
    const result = await query('SELECT * FROM posts WHERE id = $1', [id]);
    if (!result.rows.length) return null;
    
    return new Post(result.rows[0]);
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
    try {
        if (!query || typeof query !== 'string') {
          throw new Error('Invalid search query');
        }

        // Prepare the tsquery - handle multiple words
        const searchQuery = query.trim().split(/\s+/).join(' & ') + ':*';

        const result = await this.query(
          `SELECT * FROM posts 
          WHERE to_tsvector('english', content) @@ to_tsquery('english', $1)
          ORDER BY created_at DESC 
          LIMIT $2 OFFSET $3`,
          [searchQuery, limit, offset]
        );
        
        return result.rows.map(row => new this.modelClass(row));
    } catch (error) {
        console.error('Search error:', error);
        throw new Error('Failed to search posts');
    }
  }

  async getTotalSearchCount(query) {
    const searchQuery = query.trim().split(/\s+/).join(' & ') + ':*';
    
    const result = await this.query(
      `SELECT COUNT(*) FROM posts 
      WHERE to_tsvector('english', content) @@ to_tsquery('english', $1)`,
      [searchQuery]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async getTotalCountByUserId(userId) {
    const result = await this.query(
      'SELECT COUNT(*) FROM posts WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async getPostLinks(postId) {
    const result = await this.query(
      'SELECT url FROM post_links WHERE post_id = $1',
      [postId]
    );
    return result.rows.map(row => row.url);
  }
}

module.exports = new PostRepository();