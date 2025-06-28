const DeleteComment = require('../../Domains/comments/entities/DeleteComment');
const DeletedComment = require('../../Domains/comments/entities/DeletedComment');

class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ threadId, commentId, userId }) {
    const deleteComment = new DeleteComment({ threadId, commentId, userId });

    await this._threadRepository.verifyAvailableThread(deleteComment.threadId);

    await this._commentRepository.verifyCommentOwner(deleteComment.commentId, deleteComment.userId);

    const deletedCommentId = await this._commentRepository.softDeleteCommentById(deleteComment.commentId);

    return new DeletedComment(deletedCommentId);
  }
}

module.exports = DeleteCommentUseCase;
