const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../Commons/exceptions/InvariantError');

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

    if (!result.rowCount) {
      throw new InvariantError('thread gagal ditambahkan');
    }

    return new AddedThread({ ...result.rows[0] });
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
          cu.username AS comment_owner_username

        FROM threads AS t
        INNER JOIN users AS tu ON t.owner = tu.id
        INNER JOIN comments AS c ON t.id = c.thread_id
        INNER JOIN users AS cu ON c.owner = cu.id

        WHERE t.id = $1
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Thread tidak ditemukan");
    }

    const comments = result.rows.map((comment) => ({
      id: comment.comment_id,
      username: comment.comment_owner_username,
      date: comment.comment_date,
      content: comment.comment_content
    }))

    const thread = {
      id : result.rows[0].thread_id,
      title : result.rows[0].title,
      body : result.rows[0].body,
      date : result.rows[0].thread_date,
      username : result.rows[0].thread_owner_username,
      comments: comments
    }

    return thread;
  }

  async verifyAvailableThread(threadId) {

    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }
}

module.exports = ThreadRepositoryPostgres;