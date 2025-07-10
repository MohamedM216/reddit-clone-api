const { query } = require('../utils/db');
const PostImage = require('../models/PostImage');
const BaseRepository = require('./base.repository');

class PostImageRepository extends BaseRepository {
  constructor() {
    super('post_images', PostImage);
  }

  async create(postId, imageData) {
    const result = await query(
      `INSERT INTO post_images 
       (post_id, file_name, file_path, mime_type, size, order_index) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        postId,
        imageData.fileName,
        imageData.filePath,
        imageData.mimeType,
        imageData.size,
        imageData.orderIndex || 0
      ]
    );
    return new PostImage(result.rows[0]);
  }

  async findByPostId(postId) {
    const result = await query(
      'SELECT * FROM post_images WHERE post_id = $1 ORDER BY order_index ASC',
      [postId]
    );
    return result.rows.map(row => new PostImage(row));
  }

  async delete(id) {
    const result = await query(
      'DELETE FROM post_images WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows.length ? new PostImage(result.rows[0]) : null;
  }

  async deleteByPostId(postId) {
    const images = await this.findByPostId(postId);
    await query('DELETE FROM post_images WHERE post_id = $1', [postId]);
    return images;
  }
}

module.exports = new PostImageRepository();