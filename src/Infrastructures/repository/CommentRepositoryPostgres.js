const InvariantError = require('../../Commons/exceptions/InvariantError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class RepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator, dateTimeFormatter) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateTimeFormatter = dateTimeFormatter;
  }

  async addComment({ content, threadId, owner }) {
    const id = `comment-${this._idGenerator()}`;
    const createdAt = this._dateTimeFormatter.formatDateTime(new Date());

    const query = {
      text: 'INSERT INTO comments(id, content, thread_id, owner, date, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $5, $5) RETURNING id, content, owner',
      values: [id, content, threadId, owner, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('comment gagal ditambahkan');
    }

    return new AddedComment({ ...result.rows[0] });
  }
}

module.exports = RepositoryPostgres;