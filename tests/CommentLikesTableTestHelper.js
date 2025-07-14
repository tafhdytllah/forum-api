/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async addCommentLike({
    id = 'comment-like-123', userId = 'user-123', commentId = 'comment-123',
  }) {
    const createdAt = '2025-05-15T22:00:00+07:00';

    const query = {
      text: 'INSERT INTO user_comment_likes(id, user_id, comment_id, created_at, updated_at) VALUES($1, $2, $3, $4, $4)',
      values: [id, userId, commentId, createdAt],
    };

    await pool.query(query);
  },

  async findCommentLikeById(id) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM user_comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
