const DeleteReply = require('../../Domains/replies/entities/DeleteReply');
const DeletedReply = require('../../Domains/replies/entities/DeletedReply');

class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ threadId, commentId, replyId, userId }) {

    const deleteReply = new DeleteReply({ threadId, commentId, replyId, userId });

    await this._threadRepository.verifyAvailableThread(deleteReply.threadId);

    await this._commentRepository.verifyAvailableComment(deleteReply.commentId);

    await this._replyRepository.verifyReplyOwner(deleteReply.replyId, deleteReply.userId);

    const deletedReplyId = await this._replyRepository.softDeleteReplyById(deleteReply.replyId);

    return new DeletedReply(deletedReplyId);
  }
}

module.exports = DeleteReplyUseCase;
