const voteService = require('../services/vote.service');

class VoteController {
  async upvote(req, res, next) {
    try {
      const { postId, commentId } = req.params;
      const result = await voteService.vote(
        req.user.id,
        { postId, commentId },
        1
      );
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: postId ? 'Post upvoted successfully' : 'Comment upvoted successfully'
        });
      }
      return res.status(500).json({
        success:false,
        message: 'upvoting error'
      });
    } catch (error) {
      next(error);
    }
  }

  async downvote(req, res, next) {
    try {
      const { postId, commentId } = req.params;
      const result = await voteService.vote(
        req.user.id,
        { postId, commentId },
        -1
      );
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: postId ? 'Post downvoted successfully' : 'Comment downvoted successfully'
        });
      }
      return res.status(500).json({
        success:false,
        message: 'upvoting error'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeVote(req, res, next) {
    try {
      const { postId, commentId } = req.params;
      const result = await voteService.removeVote(
        req.user.id,
        { postId, commentId }
      );
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: postId ? 'Vote removed from post successfully' : 'Vote removed from comment successfully'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'error removing voting'
      });
    } catch (error) {
      next(error);
    }
  }

  async getVote(req, res, next) {
    try {
      const { postId, commentId } = req.params;
      const vote = await voteService.getVote(
        req.user.id,
        { postId, commentId }
      );
      res.status(200).json({
        success: true,
        data: { vote },
        message: vote ? 'Vote retrieved successfully' : 'No vote found',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VoteController();