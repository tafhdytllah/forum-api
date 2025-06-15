const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ userId, threadId, commentId, content }) {

    await this._threadRepository.verifyAvailableThread(threadId);

    await this._commentRepository.verifyAvailableComment(commentId);

    const addReply = new AddReply({ content, commentId, owner: userId });

    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
