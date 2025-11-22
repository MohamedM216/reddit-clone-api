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
      res.status(200).json({
        success: true,
        data: result,
        message: postId ? 'Post upvoted successfully' : 'Comment upvoted successfully'
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
      res.status(200).json({
        success: true,
        data: result,
        message: postId ? 'Post downvoted successfully' : 'Comment downvoted successfully'
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
      res.status(200).json({
        success: true,
        data: result,
        message: postId ? 'Vote removed from post successfully' : 'Vote removed from comment successfully'
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