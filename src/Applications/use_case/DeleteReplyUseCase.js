class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ threadId, commentId, replyId, owner }) {

    await this._threadRepository.verifyAvailableThread(threadId);

    await this._commentRepository.verifyAvailableComment(commentId);

    await this._replyRepository.verifyReplyOwner(replyId, owner);

    const deletedReplyId = await this._replyRepository.softDeleteReplyById(replyId);

    return deletedReplyId;
  }
}

module.exports = DeleteReplyUseCase;
