const commentRepository = require('../repositories/comment.repository');
const postRepository = require('../repositories/post.repository');

class CommentService {
  async createComment(userId, postId, content, parentId = null, io) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // If this is a reply, verify parent comment exists
    if (parentId) {
      const parentComment = await commentRepository.findById(parentId);
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }
      if (parentComment.postId.toString() !== postId.toString()) {
        throw new Error('Parent comment does not belong to this post');
      }
    }

    const comment = await commentRepository.create({
      user_id: userId,
      post_id: postId,
      parent_id: parentId,
      content
    });

    // Get comment with author details for real-time broadcast
    const commentWithAuthor = await commentRepository.getCommentWithAuthor(comment.id);

    if (io) {
      const eventName = parentId ? 'comment:reply' : 'comment:new';
      io.to(`post_${postId}`).emit(eventName, {
        postId,
        comment: commentWithAuthor,
        isReply: !!parentId
      });
      
      if (parentId) {
        io.to(`comment_${parentId}`).emit('comment:reply', {
          parentId,
          reply: commentWithAuthor
        });
      }
    }

    return commentWithAuthor;
  }

  async updateComment(commentId, userId, updateData, emitEvent = true, io) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized to update this comment');
    }

    const updatedComment = await commentRepository.updateComment(
      commentId,
      updateData
    );

    const commentWithAuthor = await commentRepository.getCommentWithAuthor(updatedComment.id);

    // Conditionally emit real-time event
    if (io && emitEvent) {
      io.to(`post_${comment.postId}`).emit('comment:updated', {
        postId: comment.postId,
        comment: commentWithAuthor
      });
    }

    return commentWithAuthor;
  }


  async getCommentsByPostId(postId, pagination = {}) {
    const [comments, total] = await Promise.all([
      commentRepository.findByPostId(postId, pagination),
      commentRepository.getTotalCountByPostId(postId)
    ]);

    return {
      data: comments,
      pagination: {
        ...pagination,
        total
      }
    };
  }

  async getRepliesByCommentId(commentId, pagination = {}) {
    const [replies, total] = await Promise.all([
      commentRepository.findByParentId(commentId, pagination),
      commentRepository.getTotalCountByParentId(commentId)
    ]);

    return {
      data: replies,
      pagination: {
        ...pagination,
        total
      }
    };
  }

  async deleteComment(commentId, userId, emitEvent = true, io) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('Unauthorized to delete this comment');
    }

    await commentRepository.delete(commentId);

    // Conditionally emit real-time event
    if (io && emitEvent) {
      io.to(`post_${comment.postId}`).emit('comment:deleted', {
        postId: comment.postId,
        commentId
      });
    }

    return { message: 'Comment deleted successfully' };
  }
}

module.exports = new CommentService();