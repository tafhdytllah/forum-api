/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const UsersTableTestHelper = {
  async addUser({
    id = 'user-123', username = 'dicoding', password = 'secret', fullname = 'Dicoding Indonesia'
  }) {
    const createdAt = new Date('2024-01-01T00:00:00+07:00');
    const query = {
      text: 'INSERT INTO users(id, username, password, fullname, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $5)',
      values: [id, username, password, fullname, createdAt],
    };

    await pool.query(query);
  },

  async findUsersById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM users WHERE 1=1');
  },
};

module.exports = UsersTableTestHelper;
