const voteRepository = require('../repositories/vote.repository');

class VoteService {
  async vote(userId, { postId, commentId }, value, io) {
    if (value !== 1 && value !== -1) {
      throw new Error('Invalid vote value');
    }

    if (!postId && !commentId) {
      throw new Error('Either postId or commentId must be provided');
    }

    if (postId && commentId) {
      throw new Error('Cannot vote on both post and comment simultaneously');
    }

    const result = await voteRepository.createOrUpdateVote(
      userId,
      { postId, commentId },
      value
    );

    if (io) {
      if (postId) {
      io.to(`post_${postId}`).emit('voteUpdate', { postId, value });
      } else {
      io.to(`comment_${commentId}`).emit('voteUpdate', { commentId, value });
      }
    }
    return result;
  }

  async removeVote(userId, { postId, commentId }, io) {
    if (!postId && !commentId) {
      throw new Error('Either postId or commentId must be provided');
    }

    if (postId && commentId) {
      throw new Error('Cannot remove vote from both post and comment simultaneously');
    }

    const result = await voteRepository.deleteVote(userId, { postId, commentId });

    if (io) {
      if (postId) {
        io.to(`post_${postId}`).emit('voteUpdate', { postId, value: 0 });
      } else {
        io.to(`comment_${commentId}`).emit('voteUpdate', { commentId, value: 0 });
      }
    }
    
    return result;
  }

  async getVote(userId, { postId, commentId }) {
    return voteRepository.getVote(userId, { postId, commentId });
  }
}

module.exports = new VoteService();