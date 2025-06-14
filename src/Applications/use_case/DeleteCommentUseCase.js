class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ threadId, commentId, owner }) {
    await this._threadRepository.verifyAvailableThread(threadId);

    await this._commentRepository.verifyCommentOwner(commentId, owner);

    const deletedCommentId = await this._commentRepository.softDeleteCommentById(commentId);

    return deletedCommentId;
  }
}

module.exports = DeleteCommentUseCase;
