class AddedReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, owner } = payload;

    this.id = id;
    this.content = content;
    this.owner = owner;

  }

  _verifyPayload({ id, content, owner }) {

    if (!id || !content || !owner) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
};

module.exports = AddedReply;