const AddCommentLike = require('../../Domains/comment_likes/entities/AddCommentLike');
const AddedCommentLike = require('../../Domains/comment_likes/entities/AddedCommentLike');

class AddCommentLikeUseCase {
  constructor({ commentRepository, commentLikeRepository }) {
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute({ userId, commentId }) {

    const addCommentLike = new AddCommentLike({ userId, commentId });
    
    await this._commentRepository.verifyAvailableComment(addCommentLike.commentId);
    
    const addedCommentLike = await this._commentLikeRepository.addCommentLike(addCommentLike);
    
    return new AddedCommentLike(addedCommentLike);
  }
}

module.exports = AddCommentLikeUseCase;
