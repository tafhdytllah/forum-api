const CommentLikeRepository = require('../CommentLikeRepository');

describe('CommentLikeRepository interface', () => {
  it('should throw error when invoking addCommentLike', async () => {
    const commentLikeRepository = new CommentLikeRepository();

    await expect(commentLikeRepository.addCommentLike('user-123', 'comment-123'))
      .rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking deleteCommentLike', async () => {
    const commentLikeRepository = new CommentLikeRepository();

    await expect(commentLikeRepository.deleteCommentLike('user-123', 'comment-123'))
      .rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking isLiked', async () => {
    const commentLikeRepository = new CommentLikeRepository();

    await expect(commentLikeRepository.isLiked('user-123', 'comment-123'))
      .rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
