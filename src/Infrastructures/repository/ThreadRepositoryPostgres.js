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
          cu.username AS comment_owner_username,
          c.is_deleted as comment_is_deleted,

          r.id AS reply_id,
          r.content AS reply_content,
          r.date AS reply_date,
          r.comment_id AS reply_comment_id,
          r.is_deleted AS reply_is_deleted,
          ru.username AS reply_owner_username

        FROM threads AS t
        LEFT JOIN users AS tu ON t.owner = tu.id
        LEFT JOIN comments AS c ON t.id = c.thread_id
        LEFT JOIN users AS cu ON c.owner = cu.id
        LEFT JOIN replies AS r ON c.id = r.comment_id
        LEFT JOIN users AS ru ON r.owner = ru.id

        WHERE t.id = $1
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }

    const commentMap = new Map();

    for (const row of result.rows) {

      if (row.comment_id && !commentMap.has(row.comment_id)) {
        commentMap.set(row.comment_id, {
          id: row.comment_id,
          username: row.comment_owner_username,
          date: row.comment_date,
          content: row.comment_is_deleted ? '**komentar telah dihapus**' : row.comment_content,
          replies: [],
        });
      }

      if (row.reply_id && row.comment_id) {
        const reply = {
          id: row.reply_id,
          username: row.reply_owner_username,
          date: row.reply_date,
          commentId: row.reply_comment_id,
          content: row.reply_is_deleted ? '**balasan telah dihapus**' : row.reply_content,
        };

        commentMap.get(row.comment_id).replies.push(reply);
      }
    }

    const comments = Array.from(commentMap.values()).map(comment => ({
      ...comment,
      replies: comment.replies.sort((a, b) => new Date(a.date) - new Date(b.date)),
    }));

    const thread = {
      id: result.rows[0].thread_id,
      title: result.rows[0].title,
      body: result.rows[0].body,
      date: result.rows[0].thread_date,
      username: result.rows[0].thread_owner_username,
      comments,
    };

    return thread;
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