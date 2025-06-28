const { query } = require('../utils/db');
const userRepository = require('./user.repository');
const postRepository = require('./post.repository');
const commentRepository = require('./comment.repository');

class VoteRepository {
  async getVote(userId, { postId, commentId }) {
    const result = await query(
      `SELECT * FROM votes 
       WHERE user_id = $1 
         AND post_id ${postId ? '= $2' : 'IS NULL'}
         AND comment_id ${commentId ? '= $3' : 'IS NULL'}`,
      [userId, postId, commentId].filter(Boolean)
    );
    return result.rows[0];
  }

  async createOrUpdateVote(userId, { postId, commentId }, value) {
    // Start transaction
    await query('BEGIN');

    try {
      const existingVote = await this.getVote(userId, { postId, commentId });

      if (existingVote) {
        await query(
          `UPDATE votes SET value = $1
           WHERE user_id = $2 
             AND post_id ${postId ? '= $3' : 'IS NULL'}
             AND comment_id ${commentId ? '= $4' : 'IS NULL'}`,
          [value, userId, postId, commentId].filter(Boolean)
        );
      } else {
        await query(
          `INSERT INTO votes (user_id, post_id, comment_id, value)
           VALUES ($1, $2, $3, $4)`,
          [userId, postId, commentId, value]
        );
      }

      // Update vote count on post or comment
      const table = postId ? 'posts' : 'comments';
      const idColumn = postId ? 'post_id' : 'comment_id';
      const idValue = postId || commentId;

      await query(
        `UPDATE ${table} SET vote_count = (
           SELECT COALESCE(SUM(value), 0) FROM votes 
           WHERE ${idColumn} = $1
         ) WHERE id = $1`,
        [idValue]
      );

      // Update user karma if the content owner is different from voter
      const content = postId 
        ? await postRepository.findById(postId)
        : await commentRepository.findById(commentId);

      if (content && content.userId !== userId) {
        const karmaChange = existingVote 
          ? value - existingVote.value  // Change from previous vote
          : value;                     // New vote

        await userRepository.incrementKarma(content.userId, karmaChange);
      }

      await query('COMMIT');

      return { success: true };
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  async deleteVote(userId, { postId, commentId }) {
    // Start transaction
    await query('BEGIN');

    try {
      const existingVote = await this.getVote(userId, { postId, commentId });
      if (!existingVote) {
        throw new Error('Vote not found');
      }

      await query(
        `DELETE FROM votes 
         WHERE user_id = $1 
           AND post_id ${postId ? '= $2' : 'IS NULL'}
           AND comment_id ${commentId ? '= $3' : 'IS NULL'}`,
        [userId, postId, commentId].filter(Boolean)
      );

      // Update vote count on post or comment
      const table = postId ? 'posts' : 'comments';
      const idColumn = postId ? 'post_id' : 'comment_id';
      const idValue = postId || commentId;

      await query(
        `UPDATE ${table} SET vote_count = (
           SELECT COALESCE(SUM(value), 0) FROM votes 
           WHERE ${idColumn} = $1
         ) WHERE id = $1`,
        [idValue]
      );

      // Update user karma if the content owner is different from voter
      const content = postId 
        ? await postRepository.findById(postId)
        : await commentRepository.findById(commentId);

      if (content && content.userId !== userId) {
        await userRepository.incrementKarma(content.userId, -existingVote.value);
      }
      
      await query('COMMIT');

      return { success: true };
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = new VoteRepository();