const voteRepository = require('../../../src/repositories/vote.repository');
const userRepository = require('../../../src/repositories/user.repository');
const postRepository = require('../../../src/repositories/post.repository');
const commentRepository = require('../../../src/repositories/comment.repository');
const db = require('../../../src/utils/db');
const { query } = db;

jest.mock('../../../src/utils/db', () => ({
  query: jest.fn(),
}));

jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/repositories/post.repository');
jest.mock('../../../src/repositories/comment.repository');

describe('voteRepository', () => {
  const mockUserId = 1;
  const mockPostId = 10;
  const mockCommentId = 20;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  //                            TEST getVote METHOD
  // =========================================================================
  describe('getVote', () => {
    it('should execute correct SQL to get a vote for a post', async () => {
      const mockVote = { user_id: mockUserId, post_id: mockPostId, value: 1 };
      query.mockResolvedValue({ rows: [mockVote] });

      const result = await voteRepository.getVote(mockUserId, { postId: mockPostId });

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM post_votes\s+WHERE user_id = \$1 AND post_id = \$2/),
        [mockUserId, mockPostId]
      );
      expect(result).toEqual(mockVote);
    });

    it('should execute correct SQL to get a vote for a comment', async () => {
      const mockVote = { user_id: mockUserId, comment_id: mockCommentId, value: -1 };
      query.mockResolvedValue({ rows: [mockVote] });

      const result = await voteRepository.getVote(mockUserId, { commentId: mockCommentId });

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM comment_votes\s+WHERE user_id = \$1 AND comment_id = \$2/),
        [mockUserId, mockCommentId]
      );
      expect(result).toEqual(mockVote);
    });

    it('should return undefined if no vote is found', async () => {
      query.mockResolvedValue({ rows: [] });

      const result = await voteRepository.getVote(mockUserId, { postId: mockPostId });

      expect(result).toBeUndefined();
    });
  });

  // =========================================================================
  //                         TEST createOrUpdateVote METHOD
  // =========================================================================
  describe('createOrUpdateVote', () => {
    let getVoteSpy;

    beforeEach(() => {
      getVoteSpy = jest.spyOn(voteRepository, 'getVote');

      query.mockImplementation((sql) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return Promise.resolve({});
        return Promise.resolve({ rows: [] });
      });
    });
    
    afterEach(() => {
      getVoteSpy.mockRestore();
    });


    it('should throw an error if neither postId nor commentId is provided', async () => {
      await expect(
        voteRepository.createOrUpdateVote(mockUserId, {}, 1)
      ).rejects.toThrow('Must specify exactly one of postId or commentId');
      expect(query).not.toHaveBeenCalled();
    });

    it('should throw an error if both postId and commentId are provided', async () => {
      await expect(
        voteRepository.createOrUpdateVote(mockUserId, { postId: mockPostId, commentId: mockCommentId }, 1)
      ).rejects.toThrow('Must specify exactly one of postId or commentId');
      expect(query).not.toHaveBeenCalled();
    });

    it('should ROLLBACK and rethrow error if any query fails', async () => {
      const dbError = new Error('SQL failure');
      
      query.mockImplementation(async (sql) => {
        if (typeof sql === 'string' && (sql.includes('INSERT') || sql.includes('UPDATE'))) {
          throw dbError;
        }
        return {};
      });

      getVoteSpy.mockResolvedValue(null);

      await expect(
        voteRepository.createOrUpdateVote(mockUserId, { postId: mockPostId }, 1)
      ).rejects.toThrow(dbError);

      expect(query).toHaveBeenCalledWith('BEGIN');
      expect(query).toHaveBeenCalledWith('ROLLBACK');
      expect(query).not.toHaveBeenCalledWith('COMMIT');
    });

    it('should INSERT a new vote and update post vote count', async () => {
      getVoteSpy.mockResolvedValue(null);
      const voteValue = 1;

      const result = await voteRepository.createOrUpdateVote(mockUserId, { postId: mockPostId }, voteValue);

      expect(query).toHaveBeenCalledWith('BEGIN');

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO post_votes \(user_id, post_id, value\)\s+VALUES \(\$1, \$2, \$3\)/),
        [mockUserId, mockPostId, voteValue]
      );

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE posts SET vote_count = \(\s*SELECT COALESCE\(SUM\(value\), 0\) FROM post_votes\s+WHERE post_id = \$1\s*\)\s+WHERE id = \$1/),
        [mockPostId]
      );
      expect(query).toHaveBeenCalledWith('COMMIT');
      expect(result).toEqual({ success: true });
    });

    it('should UPDATE an existing vote and update post vote count', async () => {
      getVoteSpy.mockResolvedValue({ user_id: mockUserId, post_id: mockPostId, value: -1 }); 
      const newVoteValue = 1;

      await voteRepository.createOrUpdateVote(mockUserId, { postId: mockPostId }, newVoteValue);

      expect(query).toHaveBeenCalledWith('BEGIN');

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE post_votes SET value = \$1\s+WHERE user_id = \$2 AND post_id = \$3/),
        [newVoteValue, mockUserId, mockPostId]
      );

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE posts SET vote_count = \(\s*SELECT COALESCE\(SUM\(value\), 0\) FROM post_votes\s+WHERE post_id = \$1\s*\)\s+WHERE id = \$1/),
        [mockPostId]
      );
      expect(query).toHaveBeenCalledWith('COMMIT');
    });


    it('should INSERT a new vote and update comment vote count', async () => {
      getVoteSpy.mockResolvedValue(null);
      const voteValue = -1;

      await voteRepository.createOrUpdateVote(mockUserId, { commentId: mockCommentId }, voteValue);

      expect(query).toHaveBeenCalledWith('BEGIN');

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO comment_votes \(user_id, comment_id, value\)\s+VALUES \(\$1, \$2, \$3\)/),
        [mockUserId, mockCommentId, voteValue]
      );

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE comments SET vote_count = \(\s*SELECT COALESCE\(SUM\(value\), 0\) FROM comment_votes\s+WHERE comment_id = \$1\s*\)\s+WHERE id = \$1/),
        [mockCommentId]
      );
      expect(query).toHaveBeenCalledWith('COMMIT');
    });

    it('should UPDATE an existing vote and update comment vote count', async () => {
      getVoteSpy.mockResolvedValue({ user_id: mockUserId, comment_id: mockCommentId, value: 1 });
      const newVoteValue = -1;

      await voteRepository.createOrUpdateVote(mockUserId, { commentId: mockCommentId }, newVoteValue);

      expect(query).toHaveBeenCalledWith('BEGIN');

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE comment_votes SET value = \$1\s+WHERE user_id = \$2 AND comment_id = \$3/),
        [newVoteValue, mockUserId, mockCommentId]
      );

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE comments SET vote_count = \(\s*SELECT COALESCE\(SUM\(value\), 0\) FROM comment_votes\s+WHERE comment_id = \$1\s*\)\s+WHERE id = \$1/),
        [mockCommentId]
      );
      expect(query).toHaveBeenCalledWith('COMMIT');
    });
  });

  // =========================================================================
  //                           TEST deleteVote METHOD
  // =========================================================================
  describe('deleteVote', () => {
    let getVoteSpy;

    const mockPostOwnerId = 5;
    const mockPost = { userId: mockPostOwnerId };
    const mockPostVote = { user_id: mockUserId, post_id: mockPostId, value: 1 };

    const mockCommentOwnerId = 6;
    const mockComment = { userId: mockCommentOwnerId };
    const mockCommentVote = { user_id: mockUserId, comment_id: mockCommentId, value: -1 };

    beforeEach(() => {
      getVoteSpy = jest.spyOn(voteRepository, 'getVote');

      query.mockImplementation((sql) => {
        if (sql === 'BEGIN' || sql === 'COMMIT' || (typeof sql === 'string' && (sql.includes('DELETE') || sql.includes('UPDATE')))) {
          return Promise.resolve({});
        }
        return Promise.resolve({ rows: [] });
      });
    });
    
    afterEach(() => {
      getVoteSpy.mockRestore();
    });
    
    it('should DELETE a post vote, update post count, and decrement karma (different owner)', async () => {
      getVoteSpy.mockResolvedValue(mockPostVote);
      postRepository.findById.mockResolvedValue(mockPost); 
      
      const result = await voteRepository.deleteVote(mockUserId, { postId: mockPostId });

      // 1. Transaction and GetVote
      expect(query).toHaveBeenCalledWith('BEGIN');
      expect(getVoteSpy).toHaveBeenCalledWith(mockUserId, { postId: mockPostId });
      
      // 2. DELETE
      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/DELETE FROM post_votes\s+WHERE user_id = \$1 AND post_id = \$2/),
        [mockUserId, mockPostId]
      );

      // 3. Post Count Update
      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE posts SET vote_count = \(\s*SELECT COALESCE\(SUM\(value\), 0\) FROM post_votes\s+WHERE post_id = \$1\s*\)\s+WHERE id = \$1/),
        [mockPostId]
      );
      
      // 4. Karma Update (Value was 1, so we decrement by -1)
      expect(userRepository.incrementKarma).toHaveBeenCalledWith(mockPostOwnerId, -mockPostVote.value);

      // 5. Commit and Result
      expect(query).toHaveBeenCalledWith('COMMIT');
      expect(result).toEqual({ success: true });
    });
    
    it('should DELETE a post vote, update post count, but NOT update karma (same owner)', async () => {
      getVoteSpy.mockResolvedValue(mockPostVote);
      postRepository.findById.mockResolvedValue({ userId: mockUserId }); // Same owner

      await voteRepository.deleteVote(mockUserId, { postId: mockPostId });

      expect(userRepository.incrementKarma).not.toHaveBeenCalled();
      
      expect(query).toHaveBeenCalledWith('COMMIT');
    });
    
    it('should throw an error if vote is not found when deleting a post vote', async () => {
      getVoteSpy.mockResolvedValue(null);
      
      await expect(
        voteRepository.deleteVote(mockUserId, { postId: mockPostId })
      ).rejects.toThrow('Vote not found');
      
      expect(query).toHaveBeenCalledWith('BEGIN');
      expect(query).toHaveBeenCalledWith('ROLLBACK');
      expect(query).not.toHaveBeenCalledWith('COMMIT');
      expect(query).not.toHaveBeenCalledWith(expect.stringMatching(/DELETE/));
    });


    it('should DELETE a comment vote, update comment count, and increment karma (different owner)', async () => {
      getVoteSpy.mockResolvedValue(mockCommentVote);
      commentRepository.findById.mockResolvedValue(mockComment);
      
      await voteRepository.deleteVote(mockUserId, { commentId: mockCommentId });

      expect(query).toHaveBeenCalledWith('BEGIN');
      expect(getVoteSpy).toHaveBeenCalledWith(mockUserId, { commentId: mockCommentId });
      
      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/DELETE FROM comment_votes\s+WHERE user_id = \$1 AND comment_id = \$2/),
        [mockUserId, mockCommentId]
      );

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE comments SET vote_count = \(\s*SELECT COALESCE\(SUM\(value\), 0\) FROM comment_votes\s+WHERE comment_id = \$1\s*\)\s+WHERE id = \$1/),
        [mockCommentId]
      );
      
      expect(userRepository.incrementKarma).toHaveBeenCalledWith(mockCommentOwnerId, -mockCommentVote.value);

      expect(query).toHaveBeenCalledWith('COMMIT');
    });

    it('should ROLLBACK and re-throw error if DELETE fails', async () => {
      const dbError = new Error('SQL failure on delete');
      getVoteSpy.mockResolvedValue(mockPostVote);
      postRepository.findById.mockResolvedValue(mockPost);
      
      query.mockImplementation(async (sql) => {
        if (typeof sql === 'string' && sql.includes('DELETE')) {
          throw dbError;
        }
        return {}; // For BEGIN, UPDATE, and ROLLBACK
      });

      await expect(
        voteRepository.deleteVote(mockUserId, { postId: mockPostId })
      ).rejects.toThrow(dbError);

      expect(query).toHaveBeenCalledWith('BEGIN');
      expect(query).toHaveBeenCalledWith('ROLLBACK');
      expect(query).not.toHaveBeenCalledWith('COMMIT');
      expect(userRepository.incrementKarma).not.toHaveBeenCalled();
    });
  });
});