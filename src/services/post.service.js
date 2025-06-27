const Post = require('../models/Post');
const postRepository = require('../repositories/post.repository');
const { validateUrl, validateImage } = require('../utils/validation');
const { extractLinks } = require('../utils/linkExtractor');

class PostService {
  async createPost(userId, postData) {
    this._validatePostData(postData);

    if (postData.imageUrl) {
      await validateImage(postData.imageUrl);
    }

    const post = await postRepository.create({
        user_id: userId,
        content: postData.content,
        image_url: postData.imageUrl
    });
    
    const links = extractLinks(postData.content);
    return { ...post.toJSON(), links };
  }

  async updatePost(postId, userId, updateData) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId !== userId) {
      throw new Error('Unauthorized to update this post');
    }

    this._validatePostData(updateData);

    if (updateData.imageUrl) {
      await validateImage(updateData.imageUrl);
    }

    // Begin transaction for atomic updates
    const { query, pool } = require('../utils/db'); 
    const client = await pool.connect(); 

    try {
      await client.query('BEGIN');

      // 1. Verify post exists and belongs to user
      const postCheck = await client.query(
          'SELECT user_id FROM posts WHERE id = $1 FOR UPDATE',
          [postId]
      );
      
      if (postCheck.rows.length === 0) {
          throw new Error('Post not found');
      }

      if (postCheck.rows[0].user_id !== userId) {
          throw new Error('Unauthorized to update this post');
      }

      // 2. Delete existing links if content is being updated
      if (updateData.content !== undefined) {
        await client.query(
            'DELETE FROM post_links WHERE post_id = $1',
            [postId]
        );
      }

      // 3. Update the post
      const updateQuery = `
        UPDATE posts 
        SET content = COALESCE($1, content),
            image_url = COALESCE($2, image_url)
        WHERE id = $3
        RETURNING *
      `;
      const result = await client.query(updateQuery, [
        updateData.content,
        updateData.imageUrl,
        postId
      ]);

      // 4. Store new links if content was updated
      if (updateData.content !== undefined) {
        const links = extractLinks(updateData.content);
        for (const link of links) {
          await client.query(
            'INSERT INTO post_links (post_id, url) VALUES ($1, $2)',
            [postId, link.url]
          );
        }
      }

      await client.query('COMMIT');

      // Return the updated post with links
      const updatedPost = new Post(result.rows[0]);
      const linksResult = await client.query(
        'SELECT url FROM post_links WHERE post_id = $1',
        [postId]
      );

      return { 
        ...updatedPost.toJSON(),
        links: linksResult.rows.map(row => row.url)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update post error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async deletePost(postId, userId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId !== userId) {
      throw new Error('Unauthorized to delete this post');
    }

    await postRepository.delete(postId);
    return { message: 'Post deleted successfully' };
  }

  async getPostById(postId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }
  async getPostById(postId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const links = await postRepository.getPostLinks(postId);
    return { ...post.toJSON(), links };
  }

  async getPostsByUserId(userId, pagination = {}) {
    const [posts, total] = await Promise.all([
      postRepository.findByUserId(userId, pagination),
      postRepository.getTotalCountByUserId(userId)
    ]);

    return {
      data: posts,
      pagination: {
        ...pagination,
        total
      }
    };
  }

  async searchPosts(query, pagination = {}) {
    const [posts, total] = await Promise.all([
      postRepository.searchPosts(query, pagination),
      postRepository.getTotalSearchCount(query)
    ]);

    return {
      data: posts,
      pagination: {
        ...pagination,
        total
      }
    };
  }

  _validatePostData(postData) {
    const { content, imageUrl } = postData;

    if (!content && !imageUrl) {
      throw new Error('Post must have content or image');
    }

    if (content && content.length > 10000) {
      throw new Error('Content must be 10,000 characters or less');
    }

    if (imageUrl && imageUrl.length > 500) {
      throw new Error('Image URL must be 500 characters or less');
    }
  }
}

module.exports = new PostService();