class DeletedComment {
  constructor(id) {
    this._verifyPayload(id);

    this.id = id;
  }

  _verifyPayload(id) {

    if (!id) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string') {
      throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
};

module.exports = DeletedComment;