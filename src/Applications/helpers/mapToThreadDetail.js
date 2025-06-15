function mapToThreadDetail(rows) {
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

  const thread = {
    id: rows[0].thread_id,
    title: rows[0].title,
    body: rows[0].body,
    date: rows[0].thread_date,
    username: rows[0].thread_owner_username,
    comments,
  };

  return thread;
}

module.exports = mapToThreadDetail;