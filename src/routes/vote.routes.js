const express = require('express');
const router = express.Router();
const voteController = require('../controllers/vote.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { strictLimiter } = require('../middlewares/rateLimiter');

router.post(
  '/posts/:postId/upvote',
  strictLimiter,
  authMiddleware.authenticate,
  voteController.upvote
);

router.post(
  '/posts/:postId/downvote',
  strictLimiter,
  authMiddleware.authenticate,
  voteController.downvote
);

router.delete(
  '/posts/:postId/vote',
  strictLimiter,
  authMiddleware.authenticate,
  voteController.removeVote
);

router.post(
  '/comments/:commentId/upvote',
  strictLimiter,
  authMiddleware.authenticate,
  voteController.upvote
);

router.post(
  '/comments/:commentId/downvote',
  strictLimiter,
  authMiddleware.authenticate,
  voteController.downvote
);

router.delete(
  '/comments/:commentId/vote',
  strictLimiter,
  authMiddleware.authenticate,
  voteController.removeVote
);

router.get(
  '/posts/:postId/vote',
  authMiddleware.authenticate,
  voteController.getVote
);

router.get(
  '/comments/:commentId/vote',
  authMiddleware.authenticate,
  voteController.getVote
);

module.exports = router;