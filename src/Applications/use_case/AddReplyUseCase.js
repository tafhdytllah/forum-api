const AddReply = require('../../Domains/replies/entities/AddReply');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ userId, threadId, commentId, content }) {

    const addReply = new AddReply({ userId, threadId, commentId, content });

    await this._threadRepository.verifyAvailableThread(addReply.threadId);

    await this._commentRepository.verifyAvailableComment(addReply.commentId);

    const addedReply = await this._replyRepository.addReply({
      content: addReply.content,
      commentId: addReply.commentId,
      owner: addReply.userId,
    });

    return new AddedReply(addedReply);
  }
}

module.exports = AddReplyUseCase;
