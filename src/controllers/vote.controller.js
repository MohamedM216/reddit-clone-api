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
      res.json(result);
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
      res.json(result);
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
      res.json(result);
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
      res.json({ vote });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VoteController();