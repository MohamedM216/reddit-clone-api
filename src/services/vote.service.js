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
      const target = postId ? `post_${postId}` : `comment_${commentId}`;
      io.to(target).emit('vote:update', {
        postId,
        commentId,
        value,
        voterId: userId
      });
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
      const target = postId ? `post_${postId}` : `comment_${commentId}`;
      io.to(target).emit('vote:remove', {
        postId,
        commentId,
        voterId: userId
      });
    }
    
    return result;
  }

  async getVote(userId, { postId, commentId }) {
    return voteRepository.getVote(userId, { postId, commentId });
  }
}

module.exports = new VoteService();