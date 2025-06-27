const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/:id', postController.getPost);
router.get('/user/:userId', postController.getUserPosts);
router.get('/search', postController.searchPosts);

// Protected routes (require authentication)
router.post('/', authMiddleware.authenticate, postController.createPost);
router.put('/:id', authMiddleware.authenticate, postController.updatePost);
router.delete('/:id', authMiddleware.authenticate, postController.deletePost);

module.exports = router;