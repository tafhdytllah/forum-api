/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'Sebuah reply', commentId = 'comment-123', owner = 'user-123', isDeleted = false, date = '2024-01-01T00:00:00.000Z',
  }) {
    const createdAt = new Date('2024-01-01T00:00:00+07:00');

    const query = {
      text: 'INSERT INTO replies(id, comment_id, content, owner, is_deleted, date, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $7)',
      values: [id, commentId, content, owner, isDeleted, date, createdAt],
    };
    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
