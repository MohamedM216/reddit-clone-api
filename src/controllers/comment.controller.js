const commentService = require('../services/comment.service');

class CommentController {
  async createComment(req, res, next) {
    try {
      const { postId } = req.params;
      const { content, parentId } = req.body;
      const comment = await commentService.createComment(
        req.user.id,
        postId,
        content,
        parentId, 
        req.io
      );
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const { content, emitEvent = true } = req.body;
      
      const comment = await commentService.updateComment(
        commentId,
        req.user.id,
        { content },
        emitEvent,
        req.io
      );
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getPostComments(req, res, next) {
    try {
      const { postId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      const result = await commentService.getCommentsByPostId(postId, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCommentReplies(req, res, next) {
    try {
      const { commentId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      const result = await commentService.getRepliesByCommentId(commentId, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const { emitEvent = true } = req.body;
      
      const result = await commentService.deleteComment(
        commentId,
        req.user.id,
        emitEvent,
        req.io
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();