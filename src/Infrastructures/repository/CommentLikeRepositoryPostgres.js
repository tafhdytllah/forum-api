const CommentLikeRepository = require('../../Domains/comment_likes/CommentLikeRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator, dateTimeFormatter) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateTimeFormatter = dateTimeFormatter;
  }

  async addCommentLike({ userId, commentId }) {
    try {
      const id = `comment-like-${this._idGenerator()}`;
      const createdAt = this._dateTimeFormatter.formatDateTime(new Date());

      const query = {
        text: 'INSERT INTO user_comment_likes(id, user_id, comment_id, created_at, updated_at) VALUES($1, $2, $3, $4, $4) RETURNING id',
        values: [id, userId, commentId, createdAt],
      };

      const result = await this._pool.query(query);

      return result.rows[0].id;
    } catch (error) {
      throw new InvariantError('comment like gagal ditambahkan');
    }
  }

  async deleteCommentLike({ userId, commentId }) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2 RETURNING id',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('comment like gagal dihapus');
    }

    return result.rows[0].id;
  }

}

module.exports = CommentLikeRepositoryPostgres;