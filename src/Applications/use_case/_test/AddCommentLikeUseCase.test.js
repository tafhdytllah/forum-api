const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository');
const AddCommentLikeUseCase = require('../AddCommentLikeUseCase');
const AddCommentLike = require('../../../Domains/comment_likes/entities/AddCommentLike');
const AddedCommentLike = require('../../../Domains/comment_likes/entities/AddedCommentLike');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('AddCommentLikeUseCase', () => {
  it('should throw error if payload not contain needed property', async () => {

    const payload = {
      // userId: 'user-123',
      commentId: 'comment-123',
    };
    const addCommentLikeUseCase = new AddCommentLikeUseCase({});

    await expect(addCommentLikeUseCase.execute(payload))
      .rejects
      .toThrowError('ADD_COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type specification', async () => {
    const payload = {
      userId: {},
      commentId: 123,
    };
    const addCommentLikeUseCase = new AddCommentLikeUseCase({});

    await expect(addCommentLikeUseCase.execute(payload))
      .rejects
      .toThrowError('ADD_COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add comment like action correctly', async () => {

    const useCasePayload = {
      userId: 'user-123',
      commentId: 'comment-123',
    };

    const addCommentLikePayload = new AddCommentLike({
      userId: 'user-123',
      commentId: 'comment-123',
    });

    const mockAddCommentLikeResult = {
      id: 'comment-like-123',
    };

    const expectedResult = new AddedCommentLike({
      id: 'comment-like-123',
    });

    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.addCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddCommentLikeResult));

    const addCommentLikeUseCase = new AddCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    const result = await addCommentLikeUseCase.execute(useCasePayload);

    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(addCommentLikePayload.commentId);
    expect(mockCommentLikeRepository.addCommentLike).toBeCalledWith(addCommentLikePayload);

    expect(result).toStrictEqual(expectedResult);
  });
});
