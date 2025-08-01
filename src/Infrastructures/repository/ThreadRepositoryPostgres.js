const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator, dateTimeFormatter) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateTimeFormatter = dateTimeFormatter;
  }

  async addThread({ title, body, userId }) {
    try {
      const id = `thread-${this._idGenerator()}`;
      const createdAt = this._dateTimeFormatter.formatDateTime(new Date());

      const query = {
        text: 'INSERT INTO threads(id, title, body, owner, date, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $5, $5) RETURNING id, title, owner',
        values: [id, title, body, userId, createdAt],
      };

      const result = await this._pool.query(query);

      return result.rows[0];
    } catch (error) {
      throw new InvariantError('thread gagal ditambahkan');
    }
  }

  async getThread(threadId) {

    const query = {
      text: `
        SELECT 
          t.id AS thread_id,
          t.title,
          t.body,
          t.date AS thread_date,
          tu.username AS thread_owner_username,

          c.id AS comment_id,
          c.content AS comment_content,
          c.date AS comment_date,
          cu.username AS comment_owner_username,
          c.is_deleted as comment_is_deleted,

          r.id AS reply_id,
          r.content AS reply_content,
          r.date AS reply_date,
          r.comment_id AS reply_comment_id,
          r.is_deleted AS reply_is_deleted,
          ru.username AS reply_owner_username,

          ucl.id AS like_id,
          ucl.comment_id AS like_comment_id,
          COUNT(ucl.id) OVER (PARTITION BY ucl.comment_id) AS like_count
        FROM threads AS t
        LEFT JOIN users AS tu ON t.owner = tu.id
        LEFT JOIN comments AS c ON t.id = c.thread_id
        LEFT JOIN users AS cu ON c.owner = cu.id
        LEFT JOIN replies AS r ON c.id = r.comment_id
        LEFT JOIN users AS ru ON r.owner = ru.id
        LEFT JOIN user_comment_likes AS ucl ON c.id = ucl.comment_id

        WHERE t.id = $1
        ORDER BY r.id ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }

    return result.rows;
  }

  async verifyAvailableThread(threadId) {

    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }
}

module.exports = ThreadRepositoryPostgres;