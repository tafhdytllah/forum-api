const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ userId, threadId, content }) {

    await this._threadRepository.verifyAvailableThread(threadId);

    const addComment = new AddComment({
      content,
      threadId,
      owner: userId,
    });

    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
