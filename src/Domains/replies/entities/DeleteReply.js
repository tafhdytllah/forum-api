class DeleteReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { threadId, commentId, replyId, userId } = payload;

    this.threadId = threadId;
    this.commentId = commentId;
    this.replyId = replyId;
    this.userId = userId;
  }

  _verifyPayload({ threadId, commentId, replyId, userId }) {

    if (!threadId || !commentId || !replyId || !userId) {
      throw new Error('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof userId !== 'string' || typeof replyId !== 'string') {
      throw new Error('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
};

module.exports = DeleteReply;