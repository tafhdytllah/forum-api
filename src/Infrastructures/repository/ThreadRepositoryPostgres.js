const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator, dateTimeFormatter) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateTimeFormatter = dateTimeFormatter;
  }

  async addThread({ title, body, owner }) {
    const id = `thread-${this._idGenerator()}`;
    const createdAt = this._dateTimeFormatter.formatDateTime(new Date());

    const query = {
      text: 'INSERT INTO threads(id, title, body, owner, date, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $5, $5) RETURNING id, title, owner',
      values: [id, title, body, owner, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;