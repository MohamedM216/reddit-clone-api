const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const { basicLimiter, strictLimiter } = require('../middlewares/rateLimiter');

// Public routes
router.get('/search', basicLimiter, postController.searchPosts);
router.get('/:id', basicLimiter, postController.getPost);
router.get('/user/:userId', basicLimiter, postController.getUserPosts);

// Protected routes
router.post(
  '/',
  strictLimiter,
  authMiddleware.authenticate,
  uploadMiddleware,
  postController.createPost
);

router.put(
  '/:id',
  strictLimiter,
  authMiddleware.authenticate,
  uploadMiddleware,
  postController.updatePost
);

router.delete(
  '/:id',
  strictLimiter,
  authMiddleware.authenticate,
  postController.deletePost
);

module.exports = router;