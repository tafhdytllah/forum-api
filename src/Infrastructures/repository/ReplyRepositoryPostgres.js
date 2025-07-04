const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator, dateTimeFormatter) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateTimeFormatter = dateTimeFormatter;
  }

  async addReply({ content, commentId, userId }) {
    try {
      const id = `reply-${this._idGenerator()}`;
      const createdAt = this._dateTimeFormatter.formatDateTime(new Date());

      const query = {
        text: 'INSERT INTO replies(id, content, comment_id, owner, date, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $5, $5) RETURNING id, content, owner',
        values: [id, content, commentId, userId, createdAt],
      };

      const result = await this._pool.query(query);

      return result.rows[0];
    } catch (error) {
      throw new InvariantError('reply gagal ditambahkan');
    }
  }

  async verifyReplyOwner(replyId, userId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }

    const reply = result.rows[0];
    if (reply.owner !== userId) {
      throw new AuthorizationError('anda tidak berhak mengakses reply ini');
    }
  }

  async softDeleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('reply gagal dihapus');
    }

    return result.rows[0].id;
  }
}

module.exports = ReplyRepositoryPostgres;