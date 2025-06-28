const AddComment = require('../../Domains/comments/entities/AddComment');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ userId, threadId, content }) {

    const addComment = new AddComment({ content, threadId, userId });

    await this._threadRepository.verifyAvailableThread(addComment.threadId);

    const addedComment = await this._commentRepository.addComment(addComment);

    return new AddedComment(addedComment);
  }
}

module.exports = AddCommentUseCase;
