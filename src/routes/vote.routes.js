const express = require('express');
const router = express.Router();
const voteController = require('../controllers/vote.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { voteOnPostSchema, voteOnCommentSchema } = require('../validations/vote.validation');
const { strictLimiter, basicLimiter } = require('../middlewares/rateLimiter');

router.post(
  '/posts/:postId/upvote',
  strictLimiter,
  authMiddleware.authenticate,
  validate(voteOnPostSchema),
  voteController.upvote
);

router.post(
  '/posts/:postId/downvote',
  strictLimiter,
  authMiddleware.authenticate,
  validate(voteOnPostSchema),
  voteController.downvote
);

router.delete(
  '/posts/:postId/vote',
  strictLimiter,
  authMiddleware.authenticate,
  validate(voteOnPostSchema),
  voteController.removeVote
);

router.get(
  '/posts/:postId/vote',
  basicLimiter,
  authMiddleware.authenticate,
  validate(voteOnPostSchema),
  voteController.getVote
);

router.post(
  '/comments/:commentId/upvote',
  strictLimiter,
  authMiddleware.authenticate,
  validate(voteOnCommentSchema),
  voteController.upvote
);

router.post(
  '/comments/:commentId/downvote',
  strictLimiter,
  authMiddleware.authenticate,
  validate(voteOnCommentSchema),
  voteController.downvote
);

router.delete(
  '/comments/:commentId/vote',
  strictLimiter,
  authMiddleware.authenticate,
  validate(voteOnCommentSchema),
  voteController.removeVote
);


router.get(
  '/comments/:commentId/vote',
  basicLimiter,
  authMiddleware.authenticate,
  validate(voteOnCommentSchema),
  voteController.getVote
);

module.exports = router;