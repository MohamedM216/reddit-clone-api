const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { basicLimiter, strictLimiter } = require('../middlewares/rateLimiter');

// protected routes
router.post(
  '/posts/:postId/comments',
  strictLimiter,
  authMiddleware.authenticate,
  commentController.createComment
);

router.put(
  '/comments/:commentId',
  strictLimiter,
  authMiddleware.authenticate,
  commentController.updateComment
);

router.delete(
  '/comments/:commentId',
  strictLimiter,
  authMiddleware.authenticate,
  commentController.deleteComment
);

// public routes
router.get(
  '/posts/:postId/comments',
  basicLimiter,
  commentController.getPostComments
);

router.get(
  '/comments/:commentId/replies',
  basicLimiter,
  commentController.getCommentReplies
);

module.exports = router;