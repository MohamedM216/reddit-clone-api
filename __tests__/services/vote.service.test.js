const voteService = require('../../src/services/vote.service');
const voteRepository = require('../../src/repositories/vote.repository');
const postRepository = require('../../src/repositories/post.repository');
const commentRepository = require('../../src/repositories/comment.repository');
const notificationService = require('../../src/services/notification.service');
const { getIO } = require('../../src/utils/socket');

jest.mock('../../src/repositories/vote.repository');
jest.mock('../../src/repositories/post.repository');
jest.mock('../../src/repositories/comment.repository');
jest.mock('../../src/services/notification.service');
jest.mock('../../src/utils/socket');

const mockEmit = jest.fn();
const mockIO = {
  to: jest.fn(() => ({ emit: mockEmit }))
};

describe('VoteService', () => {
  const mockUserId = 1;
  const mockPostId = 10;
  const mockCommentId = 20;

  beforeEach(() => {
      jest.clearAllMocks();
      getIO.mockReturnValue(mockIO);
  });

  // =========================================================================
  //                            TEST VOTE METHOD
  // =========================================================================
  describe('vote(userId, { postId, commentId }, value)', () => {
    const voteValue = 1; // Upvote

    it('should successfully call repository and emit socket update for a post upvote', async () => {
      const mockRepoResult = { success: true };
      const mockPostOwnerId = 5;
      const mockPost = { userId: mockPostOwnerId };

      voteRepository.createOrUpdateVote.mockResolvedValue(mockRepoResult);
      postRepository.findById.mockResolvedValue(mockPost);
      notificationService.createNotification.mockResolvedValue({ id: 101, type: 'upvote' });

      const result = await voteService.vote(mockUserId, { postId: mockPostId, commentId: undefined }, voteValue);

      expect(voteRepository.createOrUpdateVote).toHaveBeenCalledWith(
        mockUserId,
        { postId: mockPostId, commentId: undefined },
        voteValue
      );

      expect(mockIO.to).toHaveBeenCalledWith(`post_${mockPostId}`);
      expect(mockEmit).toHaveBeenCalledWith('vote:update', {
        postId: mockPostId,
        commentId: undefined,
        value: voteValue,
        voterId: mockUserId
      });
      
      // Verify Notification (Post Owner is different from voter)
      expect(postRepository.findById).toHaveBeenCalledWith(mockPostId);
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockPostOwnerId, // Owner ID
          senderId: mockUserId,   // Voter ID
          postId: mockPostId,
          commentId: undefined,
          type: 'upvote'
        })
      );
      
      // Verify Notification Socket Emit
      expect(mockIO.to).toHaveBeenCalledWith(`user_${mockPostOwnerId}`);
      expect(mockEmit).toHaveBeenCalledWith('notification:new', { id: 101, type: 'upvote' });

      expect(result).toBe(mockRepoResult);
    });
    
    it('should successfully call repository and emit socket update for a comment downvote', async () => {
      const mockRepoResult = { success: true };
      const mockCommentOwnerId = 6;
      const mockComment = { userId: mockCommentOwnerId };
      const downvoteValue = -1;

      voteRepository.createOrUpdateVote.mockResolvedValue(mockRepoResult);
      commentRepository.findById.mockResolvedValue(mockComment);
      await voteService.vote(mockUserId, { postId: undefined, commentId: mockCommentId }, downvoteValue);

      expect(voteRepository.createOrUpdateVote).toHaveBeenCalledWith(
        mockUserId,
        { postId: undefined, commentId: mockCommentId },
        downvoteValue
      );

      expect(mockIO.to).toHaveBeenCalledWith(`comment_${mockCommentId}`);
      expect(mockEmit).toHaveBeenCalledWith('vote:update', {
        postId: undefined,
        commentId: mockCommentId,
        value: downvoteValue,
        voterId: mockUserId
      });
      
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockCommentOwnerId,
          type: 'downvote'
        })
      );

      expect(voteRepository.createOrUpdateVote).toHaveBeenCalledTimes(1);
    });
    
    it('should NOT create notification if voter is the content owner', async () => {
      const mockRepoResult = { success: true };
      const mockPost = { userId: mockUserId }; // Owner is the voter

      voteRepository.createOrUpdateVote.mockResolvedValue(mockRepoResult);
      postRepository.findById.mockResolvedValue(mockPost);
      await voteService.vote(mockUserId, { postId: mockPostId, commentId: undefined }, voteValue);

      expect(postRepository.findById).toHaveBeenCalledWith(mockPostId);
      expect(notificationService.createNotification).not.toHaveBeenCalled();
      expect(mockIO.to).not.toHaveBeenCalledWith(`user_${mockUserId}`);
    });
    
    it('should NOT emit socket events if getIO returns falsy (i.e. socket not initialized)', async () => {
      getIO.mockReturnValue(null);
      voteRepository.createOrUpdateVote.mockResolvedValue({ success: true });
      await voteService.vote(mockUserId, { postId: mockPostId, commentId: undefined }, voteValue);

      expect(voteRepository.createOrUpdateVote).toHaveBeenCalledTimes(1);
      
      expect(mockIO.to).not.toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
      expect(notificationService.createNotification).not.toHaveBeenCalled();
    });


    it('should throw an error if voteRepository returns success: false', async () => {
      voteRepository.createOrUpdateVote.mockResolvedValue({ success: false });

      await expect(
        voteService.vote(mockUserId, { postId: mockPostId, commentId: undefined }, voteValue)
      ).rejects.toThrow('No such post id or comment id');
      
      expect(getIO).not.toHaveBeenCalled();
    });

    it('should rethrow an error if voteRepository call fails', async () => {
      const dbError = new Error('Database connection failed');
      voteRepository.createOrUpdateVote.mockRejectedValue(dbError);

      await expect(
        voteService.vote(mockUserId, { postId: mockPostId, commentId: undefined }, voteValue)
      ).rejects.toThrow(dbError);
      
      expect(getIO).not.toHaveBeenCalled();
    });
    
    it('should rethrow an error if notification creation fails', async () => {
      const notificationError = new Error('Notification DB failed');
      const mockPost = { userId: 5 };

      voteRepository.createOrUpdateVote.mockResolvedValue({ success: true });
      postRepository.findById.mockResolvedValue(mockPost);
      notificationService.createNotification.mockRejectedValue(notificationError); 
      
      await expect(
        voteService.vote(mockUserId, { postId: mockPostId, commentId: undefined }, voteValue)
      ).rejects.toThrow(notificationError);
      
      expect(voteRepository.createOrUpdateVote).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  //                          TEST REMOVE VOTE METHOD
  // =========================================================================
  describe('removeVote(userId, { postId, commentId })', () => {
    it('should successfully call voteRepository.deleteVote for a post', async () => {
        const mockRepoResult = { success: true };

        voteRepository.deleteVote.mockResolvedValue(mockRepoResult);
        const result = await voteService.removeVote(mockUserId, { postId: mockPostId });

        expect(voteRepository.deleteVote).toHaveBeenCalledWith(
          mockUserId,
          { postId: mockPostId, commentId: undefined }
        );

        expect(result).toBe(mockRepoResult);
    });

    it('should successfully call voteRepository.deleteVote for a comment', async () => {
      const mockRepoResult = { success: true };

      voteRepository.deleteVote.mockResolvedValue(mockRepoResult);
      const result = await voteService.removeVote(mockUserId, { commentId: mockCommentId });

      expect(voteRepository.deleteVote).toHaveBeenCalledWith(
        mockUserId,
        { postId: undefined, commentId: mockCommentId }
      );
      
      expect(result).toBe(mockRepoResult);
    });
    
    it('should rethrow an error if voteRepository.deleteVote fails', async () => {
      const dbError = new Error('Transaction rollback failed');
      voteRepository.deleteVote.mockRejectedValue(dbError);

      await expect(
        voteService.removeVote(mockUserId, { postId: mockPostId })
      ).rejects.toThrow(dbError);
    });
  });

  // =========================================================================
  //                           TEST GET VOTE METHOD
  // =========================================================================
  describe('getVote(userId, { postId, commentId })', () => {
    const mockRawVote = { user_id: mockUserId, post_id: mockPostId, value: 1 };
    
    it('should successfully call voteRepository.getVote and return the result for a post', async () => {
      voteRepository.getVote.mockResolvedValue(mockRawVote);

      const result = await voteService.getVote(mockUserId, { postId: mockPostId });

      expect(voteRepository.getVote).toHaveBeenCalledWith(
        mockUserId,
        { postId: mockPostId, commentId: undefined }
      );

      expect(result).toBe(mockRawVote);
    });
    
    it('should successfully call voteRepository.getVote and return the result for a comment', async () => {
      const mockRawCommentVote = { user_id: mockUserId, comment_id: mockCommentId, value: -1 };
      voteRepository.getVote.mockResolvedValue(mockRawCommentVote);

      const result = await voteService.getVote(mockUserId, { commentId: mockCommentId });

      expect(voteRepository.getVote).toHaveBeenCalledWith(
        mockUserId,
        { postId: undefined, commentId: mockCommentId }
      );

      expect(result).toBe(mockRawCommentVote);
    });

    it('should rethrow an error if voteRepository.getVote fails', async () => {
      const dbError = new Error('Get vote failed');
      voteRepository.getVote.mockRejectedValue(dbError);

      await expect(
        voteService.getVote(mockUserId, { postId: mockPostId })
      ).rejects.toThrow(dbError);
    });
  });
});