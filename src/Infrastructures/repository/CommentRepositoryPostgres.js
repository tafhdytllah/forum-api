const InvariantError = require('../../Commons/exceptions/InvariantError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator, dateTimeFormatter) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateTimeFormatter = dateTimeFormatter;
  }

  async addComment({ content, threadId, userId }) {
    try {
      const id = `comment-${this._idGenerator()}`;
      const createdAt = this._dateTimeFormatter.formatDateTime(new Date());

      const query = {
        text: 'INSERT INTO comments(id, content, thread_id, owner, date, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $5, $5) RETURNING id, content, owner',
        values: [id, content, threadId, userId, createdAt],
      };

      const result = await this._pool.query(query);

      return result.rows[0];
    } catch (error) {
      throw new InvariantError('comment gagal ditambahkan');
    }
  }

  async verifyCommentOwner(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    const comment = result.rows[0];
    if (comment.owner !== userId) {
      throw new AuthorizationError('anda tidak berhak mengakses comment ini');
    }
  }

  async verifyAvailableComment(commentId) {

    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 LIMIT 1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async softDeleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('comment gagal dihapus');
    }

    return result.rows[0].id;
  }
}

module.exports = CommentRepositoryPostgres;