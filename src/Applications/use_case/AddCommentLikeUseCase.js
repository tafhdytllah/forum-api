const AddCommentLike = require('../../Domains/comment_likes/entities/AddCommentLike');

class AddCommentLikeUseCase {
  constructor({ commentRepository, threadRepository, commentLikeRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute({ userId, threadId, commentId }) {

    const addCommentLike = new AddCommentLike({ userId, threadId, commentId });

    await this._threadRepository.verifyAvailableThread(addCommentLike.threadId);

    await this._commentRepository.verifyAvailableComment(addCommentLike.commentId);

    const isAlreadyLiked = await this._commentLikeRepository.isLiked(addCommentLike.userId, addCommentLike.commentId);

    if (isAlreadyLiked) {
      await this._commentLikeRepository.deleteCommentLike(addCommentLike.userId, addCommentLike.commentId);
    } else {
      await this._commentLikeRepository.addCommentLike(addCommentLike.userId, addCommentLike.commentId);
    }

  }
}

module.exports = AddCommentLikeUseCase;
