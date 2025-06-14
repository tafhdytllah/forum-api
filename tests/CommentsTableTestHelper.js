/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async AddComment({
    id = 'comment-123', content = 'Sebuah comment', threadId = 'thread-123', owner = 'user-123',
  }) {
    const createdAt = new Date('2024-01-01T00:00:00+07:00');

    const query = {
      text: 'INSERT INTO comments(id, content, thread_id, owner, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $5)',
      values: [id, content, threadId, owner, createdAt],
    };
    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
