class ThreadDetail {
  constructor(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_ROWS');
    }

    const { thread, comments } = this._toThreadDetailFromRows(rows);

    this._verifyThreadPayload(thread);

    this.id = thread.thread_id;
    this.title = thread.title;
    this.body = thread.body;
    this.date = thread.thread_date;
    this.username = thread.thread_owner_username;
    this.comments = comments;
  }

  _verifyThreadPayload({ thread_id, title, body, thread_date, thread_owner_username }) {
    if (!thread_id || !title || !body || !thread_date || !thread_owner_username) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof thread_id !== 'string' ||
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      typeof thread_date !== 'string' ||
      typeof thread_owner_username !== 'string'
    ) {
      throw new Error('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _toThreadDetailFromRows(rows) {
    const commentMap = new Map();

    for (const row of rows) {
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

    return {
      thread: rows[0],
      comments,
    };
  }
}

module.exports = ThreadDetail;
