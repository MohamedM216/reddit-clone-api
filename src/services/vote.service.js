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
      const targetRoom = postId ? `post_${postId}` : `comment_${commentId}`;
      
      io.to(targetRoom).emit('vote:update', {
        postId,
        commentId,
        value,
        voterId: userId
      });

      let contentOwnerId;
      if (postId) {
        const post = await postRepository.findById(postId);
        contentOwnerId = post?.userId;
      } else {
        const comment = await commentRepository.findById(commentId);
        contentOwnerId = comment?.userId;
      }

      if (contentOwnerId && contentOwnerId !== userId) {
        io.to(`user_${contentOwnerId}`).emit('notification:new', {
          type: value === 1 ? 'upvote' : 'downvote',
          data: {
            postId,
            commentId,
            voterId: userId,
            value
          }
        });
      }
    }
    return result;
  }

  async removeVote(userId, { postId, commentId }) {
    if (!postId && !commentId) {
      throw new Error('Either postId or commentId must be provided');
    }

    if (postId && commentId) {
      throw new Error('Cannot remove vote from both post and comment simultaneously');
    }

    const result = await voteRepository.deleteVote(userId, { postId, commentId });
    
    return result;
  }

  async getVote(userId, { postId, commentId }) {
    return voteRepository.getVote(userId, { postId, commentId });
  }
}

module.exports = new VoteService();