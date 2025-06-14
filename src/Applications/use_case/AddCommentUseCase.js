const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute({ userId, threadId, content }) {

    // await this_.commentRepository.verifyCommentOwner(userId, threadId);

    const addComment = new AddComment({
      content,
      threadId,
      owner: userId,
    });

    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
