const { query } = require('../utils/db');
const userRepository = require('./user.repository');
const postRepository = require('./post.repository');
const commentRepository = require('./comment.repository');

class VoteRepository {
  async getVote(userId, { postId, commentId }) {
    if (postId) {
      const result = await query(
        `SELECT * FROM post_votes 
         WHERE user_id = $1 AND post_id = $2`,
        [userId, postId]
      );
      return result.rows[0];
    } else {
      const result = await query(
        `SELECT * FROM comment_votes 
         WHERE user_id = $1 AND comment_id = $2`,
        [userId, commentId]
      );
      return result.rows[0];
    }
  }

  async createOrUpdateVote(userId, { postId, commentId }, value) {
    if ((!postId && !commentId) || (postId && commentId)) {
      throw new Error('Must specify exactly one of postId or commentId');
    }

    // Start transaction
    await query('BEGIN');

    try {
      if (postId) {
        const existingVote = await this.getVote(userId, { postId });

        if (existingVote) {
          // Update existing vote
          await query(
            `UPDATE post_votes SET value = $1
             WHERE user_id = $2 AND post_id = $3`,
            [value, userId, postId]
          );
        } else {
          // Create new vote
          await query(
            `INSERT INTO post_votes (user_id, post_id, value)
             VALUES ($1, $2, $3)`,
            [userId, postId, value]
          );
        }

        // Update post vote count
        await query(
          `UPDATE posts SET vote_count = (
             SELECT COALESCE(SUM(value), 0) FROM post_votes 
             WHERE post_id = $1
           ) WHERE id = $1`,
          [postId]
        );

        // Update user karma if the post owner is different from voter
        const post = await postRepository.findById(postId);
        if (post && post.userId !== userId) {
          const karmaChange = existingVote ? value - existingVote.value : value;
          await userRepository.incrementKarma(post.userId, karmaChange);
        }
      } else {
        const existingVote = await this.getVote(userId, { commentId });

        if (existingVote) {
          // Update existing vote
          await query(
            `UPDATE comment_votes SET value = $1
             WHERE user_id = $2 AND comment_id = $3`,
            [value, userId, commentId]
          );
        } else {
          // Create new vote
          await query(
            `INSERT INTO comment_votes (user_id, comment_id, value)
             VALUES ($1, $2, $3)`,
            [userId, commentId, value]
          );
        }

        // Update comment vote count
        await query(
          `UPDATE comments SET vote_count = (
             SELECT COALESCE(SUM(value), 0) FROM comment_votes 
             WHERE comment_id = $1
           ) WHERE id = $1`,
          [commentId]
        );

        // Update user karma if the comment owner is different from voter
        const comment = await commentRepository.findById(commentId);
        if (comment && comment.userId !== userId) {
          const karmaChange = existingVote ? value - existingVote.value : value;
          await userRepository.incrementKarma(comment.userId, karmaChange);
        }
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
      if (postId) {
        const existingVote = await this.getVote(userId, { postId });
        if (!existingVote) {
          throw new Error('Vote not found');
        }

        await query(
          `DELETE FROM post_votes 
           WHERE user_id = $1 AND post_id = $2`,
          [userId, postId]
        );

        // Update post vote count
        await query(
          `UPDATE posts SET vote_count = (
             SELECT COALESCE(SUM(value), 0) FROM post_votes 
             WHERE post_id = $1
           ) WHERE id = $1`,
          [postId]
        );

        // Update user karma if the post owner is different from voter
        const post = await postRepository.findById(postId);
        if (post && post.userId !== userId) {
          await userRepository.incrementKarma(post.userId, -existingVote.value);
        }
      } else {
        const existingVote = await this.getVote(userId, { commentId });
        if (!existingVote) {
          throw new Error('Vote not found');
        }

        await query(
          `DELETE FROM comment_votes 
           WHERE user_id = $1 AND comment_id = $2`,
          [userId, commentId]
        );

        // Update comment vote count
        await query(
          `UPDATE comments SET vote_count = (
             SELECT COALESCE(SUM(value), 0) FROM comment_votes 
             WHERE comment_id = $1
           ) WHERE id = $1`,
          [commentId]
        );

        // Update user karma if the comment owner is different from voter
        const comment = await commentRepository.findById(commentId);
        if (comment && comment.userId !== userId) {
          await userRepository.incrementKarma(comment.userId, -existingVote.value);
        }
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