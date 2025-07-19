const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLikeRepository = require('../../../Domains/comment_likes/CommentLikeRepository');
const AddCommentLikeUseCase = require('../AddCommentLikeUseCase');
const AddCommentLike = require('../../../Domains/comment_likes/entities/AddCommentLike');

describe('AddCommentLikeUseCase', () => {
  it('should throw error if payload not contain needed property', async () => {

    const payload = {
      // userId: 'user-123',
      threadId: 'thread-123',
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
      threadId: [],
      commentId: 123,
    };
    const addCommentLikeUseCase = new AddCommentLikeUseCase({});

    await expect(addCommentLikeUseCase.execute(payload))
      .rejects
      .toThrowError('ADD_COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrate the add comment like action correctly (when not yet liked)', async () => {
    const payload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const addCommentLikePayload = new AddCommentLike(payload);

    const mockAddCommentLikeResult = {
      id: 'comment-like-123'
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.isLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(false)); // not liked yet
    mockCommentLikeRepository.addCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddCommentLikeResult));

    const addCommentLikeUseCase = new AddCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    await addCommentLikeUseCase.execute(payload);

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(payload.commentId);
    expect(mockCommentLikeRepository.isLiked).toBeCalledWith(payload.userId, payload.commentId);
    expect(mockCommentLikeRepository.addCommentLike).toBeCalledWith(payload.userId, payload.commentId);

  });

  it('should orchestrate the add comment like action correctly (when already liked)', async () => {
    const payload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const addCommentLikePayload = new AddCommentLike(payload);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.isLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(true)); // already liked
    mockCommentLikeRepository.deleteCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addCommentLikeUseCase = new AddCommentLikeUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    await addCommentLikeUseCase.execute(payload);

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(payload.commentId);
    expect(mockCommentLikeRepository.isLiked).toBeCalledWith(payload.userId, payload.commentId);
    expect(mockCommentLikeRepository.deleteCommentLike).toBeCalledWith(payload.userId, payload.commentId);

  });
});
