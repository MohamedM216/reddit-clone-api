const path = require('path');
const Post = require('../models/Post');
const postRepository = require('../repositories/post.repository');
const postImageRepository = require('../repositories/postImage.repository');
const { extractLinks } = require('../utils/linkExtractor');
const { saveFile, validateFile, deleteFile } = require('../utils/fileUpload');
const { UPLOAD } = require('../../config');

class PostService {
  async createPost(userId, postData, files = []) {
    if (files.length > UPLOAD.MAX_IMAGES_PER_POST) {
      throw new Error(`Maximum ${UPLOAD.MAX_IMAGES_PER_POST} images allowed per post`);
    }
      
    files.forEach(file => validateFile(file));
    
    const { pool } = require('../utils/db');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const post = await postRepository.create({
        user_id: userId,
        content: postData.content
      });

      if (files.length > 0) {
        await this._savePostImages(post.id, files);
      }

      await client.query('COMMIT');

      const links = extractLinks(postData.content);
  
      return this._getPostWithImages(post.id, links);
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (files.length > 0) {
        await Promise.all(files.map(file => 
            deleteFile(path.join(UPLOAD.DIR, file.filename || file.originalname))
        ));
      }
      console.error('Update post error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updatePost(postId, userId, updateData, files = []) {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.userId !== userId) throw new Error('Unauthorized');

    if (files.length > UPLOAD.MAX_IMAGES_PER_POST) {
      throw new Error(`Maximum ${UPLOAD.MAX_IMAGES_PER_POST} images allowed per post`);
    }
    
    files.forEach(file => validateFile(file));
    
    const { pool } = require('../utils/db');
    const client = await pool.connect(); 

    try {
      await client.query('BEGIN');

      if (files.length > 0) {
        const oldImages = await postImageRepository.deleteByPostId(postId);
        await Promise.all(oldImages.map(img => deleteFile(img.filePath)));
      }

      if (updateData.content !== undefined) {
        await client.query(
            'DELETE FROM post_links WHERE post_id = $1',
            [postId]
        );
      }

      if (files.length > 0) {
        await this._savePostImages(postId, files);
      }

      const updatedPost = await postRepository.update(postId, updateData);

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

      const linksResult = await client.query(
        'SELECT url FROM post_links WHERE post_id = $1',
        [postId]
      );
      const links = linksResult.rows.map(row => row.url);
      return this._getPostWithImages(updatedPost.id, links);

    } catch (error) {
      await client.query('ROLLBACK');

      if (files.length > 0) {
        await Promise.all(files.map(file => 
            deleteFile(path.join(UPLOAD.DIR, file.filename || file.originalname))
        ));
      }

      console.error('Update post error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async _savePostImages(postId, files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const savedFile = await saveFile(file);
      await postImageRepository.create(postId, {
        ...savedFile,
        orderIndex: i
      });
    }
  }

  async _getPostWithImages(postId, links) {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error('Post not found');
    console.log(`post: ${post.toJSON()}`);

    const images = await postImageRepository.findByPostId(postId);
    console.log(`images: ${images.map(i => i.toJSON())}`);

    return { 
      ...post.toJSON(),
      links,
      images: images.map(img => ({
        id: img.id,
        url: `/uploads/${img.fileName}`,
        orderIndex: img.orderIndex
      }))
    };
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

    const [links, images] = await Promise.all([
      postRepository.getPostLinks(postId),
      postImageRepository.findByPostId(postId)
    ]);

    return { 
      ...post.toJSON(), 
      links,
      images: images.map(img => ({
        id: img.id,
        url: `/uploads/${img.fileName}`,
        orderIndex: img.orderIndex
      }))
    };
  }

  async getPostsByUserId(userId, pagination = {}) {
    const [posts, total] = await Promise.all([
      postRepository.findByUserId(userId, pagination),
      postRepository.getTotalCountByUserId(userId)
    ]);

    const postsWithImages = await Promise.all(
      posts.map(async post => {
        const images = await postImageRepository.findByPostId(post.id);
        return {
          ...post.toJSON(),
          images: images.map(img => ({
            id: img.id,
            url: `/uploads/${img.fileName}`,
            orderIndex: img.orderIndex
          }))
        };
      })
    );

    return {
      data: postsWithImages,
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

    const postsWithImages = await Promise.all(
      posts.map(async post => {
        const images = await postImageRepository.findByPostId(post.id);
        return {
          ...post.toJSON(),
          images: images.map(img => ({
            id: img.id,
            url: `/uploads/${img.fileName}`,
            orderIndex: img.orderIndex
          }))
        };
      })
    );

    return {
      data: postsWithImages,
      pagination: {
        ...pagination,
        total
      }
    };
  }
}

module.exports = new PostService();