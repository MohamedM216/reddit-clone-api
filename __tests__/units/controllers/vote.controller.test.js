const voteController = require('../../../src/controllers/vote.controller');
const voteService = require('../../../src/services/vote.service');

jest.mock('../../../src/services/vote.service', () => ({
    vote: jest.fn(),
    removeVote: jest.fn(),
    getVote: jest.fn()
}));

describe('VoteController', () => {
  let req, res, next;
  const mockUserId = 99;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      user: { id: mockUserId }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  const runActionTests = (actionName, httpMethod, expectedValue, successMessagePost, successMessageComment) => {
    const controllerMethod = voteController[actionName];
    const isRemove = actionName === 'removeVote';
    const mockServiceMethod = isRemove ? voteService.removeVote : voteService.vote;
    const expectedServiceArgs = isRemove ? 2 : 3;

    describe(`${actionName}`, () => {
      // --- SUCCESS SCENARIOS ---
      it(`should successfully ${httpMethod} post, return 200, and correct message`, async () => {
        const postId = '100';
        req.params = { postId };

        mockServiceMethod.mockResolvedValue({ success: true });

        await controllerMethod(req, res, next);

        if (isRemove) {
            expect(mockServiceMethod).toHaveBeenCalledWith(mockUserId, { postId, commentId: undefined });
        } else {
            expect(mockServiceMethod).toHaveBeenCalledWith(mockUserId, { postId, commentId: undefined }, expectedValue);
        }
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: successMessagePost
        });
        expect(next).not.toHaveBeenCalled();
      });

      it(`should successfully ${httpMethod} comment, return 200, and correct message`, async () => {
        const commentId = '200';
        req.params = { commentId };

        mockServiceMethod.mockResolvedValue({ success: true });

        await controllerMethod(req, res, next);

        if (isRemove) {
            expect(mockServiceMethod).toHaveBeenCalledWith(mockUserId, { postId: undefined, commentId });
        } else {
            expect(mockServiceMethod).toHaveBeenCalledWith(mockUserId, { postId: undefined, commentId }, expectedValue);
        }

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: successMessageComment
        });
        expect(next).not.toHaveBeenCalled();
      });

      // --- FAILURE SCENARIOS ---
      it('should return 500 and an error message if service result success is false', async () => {
        req.params = { postId: '100' };

        // Mock service failure (without throwing an exception)
        mockServiceMethod.mockResolvedValue({ success: false });

        await controllerMethod(req, res, next);

        // NOTE: current controller implementation sends 500 when result.success is false
        // For production-readiness, the service should ideally throw an error on business logic failure.
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
        expect(next).not.toHaveBeenCalled();
      });

      it('should call next() to forward errors thrown by the service', async () => {
        req.params = { postId: '100' };
        const serviceError = new Error('Database connection failed');

        mockServiceMethod.mockRejectedValue(serviceError);

        await controllerMethod(req, res, next);

        expect(next).toHaveBeenCalledWith(serviceError);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });
    });
  };
  
  runActionTests('upvote', 'upvote', 1, 'Post upvoted successfully', 'Comment upvoted successfully');
  runActionTests('downvote', 'downvote', -1, 'Post downvoted successfully', 'Comment downvoted successfully');
  runActionTests('removeVote', 'remove vote', null, 'Vote removed from post successfully', 'Vote removed from comment successfully');

  describe('getVote', () => {
    it('should successfully get vote for a post and return 200', async () => {
      req.params = { postId: '100' };

      const mockVote = { user_id: mockUserId, post_id: 100, value: 1 };
      voteService.getVote.mockResolvedValue(mockVote);

      await voteController.getVote(req, res, next);

      expect(voteService.getVote).toHaveBeenCalledWith(mockUserId, { postId: '100', commentId: undefined });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Vote retrieved successfully',
        data: {
          vote: mockVote
        }
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should successfully get vote for a comment and return 200', async () => {
      req.params = { commentId: '200' };
    
      const mockCommentVote = { user_id: mockUserId, comment_id: 200, value: -1 };
      voteService.getVote.mockResolvedValue(mockCommentVote);

      await voteController.getVote(req, res, next);

      expect(voteService.getVote).toHaveBeenCalledWith(mockUserId, { postId: undefined, commentId: '200' });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Vote retrieved successfully',
        data: {
          vote: mockCommentVote
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() to forward errors thrown by the service', async () => {
      req.params = { postId: '100' };

      const serviceError = new Error('Database connection failed on get');
      voteService.getVote.mockRejectedValue(serviceError);

      await voteController.getVote(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

});