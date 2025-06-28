const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// protected routes
router.post(
  '/posts/:postId/comments',
  authMiddleware.authenticate,
  commentController.createComment
);

router.delete(
  '/comments/:commentId',
  authMiddleware.authenticate,
  commentController.deleteComment
);

// public routes
router.get(
  '/posts/:postId/comments',
  commentController.getPostComments
);

router.get(
  '/comments/:commentId/replies',
  commentController.getCommentReplies
);

module.exports = router;