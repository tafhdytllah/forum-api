class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { userId, threadId, commentId, content } = payload;

    this.userId = userId;
    this.threadId = threadId;
    this.commentId = commentId;
    this.content = content;
  }

  _verifyPayload({ userId, threadId, commentId, content }) {

    if (!userId || !threadId || !commentId || !content) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof userId !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string' || typeof content !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
};

module.exports = AddReply;