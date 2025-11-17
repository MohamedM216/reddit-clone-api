const voteRepository = require('../repositories/vote.repository');
const postRepository = require('../repositories/post.repository');
const commentRepository = require('../repositories/comment.repository');
const notificationService = require('../services/notification.service');
const { getIO } = require('../utils/socket');

class VoteService {
  async vote(userId, { postId, commentId }, value) {
    const result = await voteRepository.createOrUpdateVote(
      userId,
      { postId, commentId },
      value
    );

    const io = getIO();

    if (io) {
      const targetRoom = postId ? `post_${postId}` : `comment_${commentId}`;
      
      io.to(targetRoom).emit('vote:update', {
        postId,
        commentId,
        value,
        voterId: userId
      });

      try {
        let contentOwnerId;
        if (postId) {
          const post = await postRepository.findById(postId);
          contentOwnerId = post?.userId;
        } else {
          const comment = await commentRepository.findById(commentId);
          contentOwnerId = comment?.userId;
        }

        if (contentOwnerId && contentOwnerId.toString() !== userId.toString()) {
          const notification = await notificationService.createNotification({
            userId: contentOwnerId,
            senderId: userId,
            postId,
            commentId,
            type: value === 1 ? 'upvote' : 'downvote'
          });
          
          io.to(`user_${contentOwnerId}`).emit('notification:new', notification);
        }
      } catch (error) {
        console.error('Error creating vote notification:', error);
      }
    }

    return result;
  }

  async removeVote(userId, { postId, commentId }) {
    const result = await voteRepository.deleteVote(userId, { postId, commentId });
    
    return result;
  }

  async getVote(userId, { postId, commentId }) {
    return voteRepository.getVote(userId, { postId, commentId });
  }
}

module.exports = new VoteService();