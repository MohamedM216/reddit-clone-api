const postService = require('../services/post.service');

class PostController {
  async createPost(req, res, next) {
    try {
      const post = await postService.createPost(req.user.id, req.body);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req, res, next) {
    try {
      const post = await postService.updatePost(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      const result = await postService.deletePost(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPost(req, res, next) {
    try {
      const post = await postService.getPostById(req.params.id);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async getUserPosts(req, res, next) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const result = await postService.getPostsByUserId(req.params.userId, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async searchPosts(req, res, next) {
    try {
      const { q: query, limit = 10, offset = 0 } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const result = await postService.searchPosts(query, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();