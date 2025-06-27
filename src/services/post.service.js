const postRepository = require('../repositories/post.repository');
const { validateUrl, validateImage } = require('../utils/validation');
const userRepository = require('../repositories/user.repository');

class PostService {
  async createPost(userId, postData) {
    this._validatePostData(postData);

    if (postData.type === 'link' && postData.link) {
      await validateUrl(postData.link);
    } else if (postData.type === 'image' && postData.imageUrl) {
      await validateImage(postData.imageUrl);
    }

    const post = await postRepository.create({
      user_id: userId,
      ...postData
    });

    return post;
  }

  async updatePost(postId, userId, updateData) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId !== userId) {
      throw new Error('Unauthorized to update this post');
    }

    this._validatePostData(updateData, true);

    if (updateData.type === 'link' && updateData.link) {
      await validateUrl(updateData.link);
    } else if (updateData.type === 'image' && updateData.imageUrl) {
      await validateImage(updateData.imageUrl);
    }

    const updatedPost = await postRepository.update(postId, updateData);
    return updatedPost;
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

  _validatePostData(postData, isUpdate = false) {
    const { title, type, content, link, imageUrl } = postData;

    if (!isUpdate) {
      if (!title || !type) {
        throw new Error('Title and type are required');
      }
    }

    if (title && title.length > 300) {
      throw new Error('Title must be 300 characters or less');
    }

    if (type && !['text', 'link', 'image'].includes(type)) {
      throw new Error('Invalid post type');
    }

    if (type === 'text' && !content) {
      throw new Error('Content is required for text posts');
    }

    if (type === 'link' && !link) {
      throw new Error('Link is required for link posts');
    }

    if (type === 'image' && !imageUrl) {
      throw new Error('Image URL is required for image posts');
    }

    if (link && link.length > 500) {
      throw new Error('Link must be 500 characters or less');
    }

    if (imageUrl && imageUrl.length > 500) {
      throw new Error('Image URL must be 500 characters or less');
    }
  }
}

module.exports = new PostService();