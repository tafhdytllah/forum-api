const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const DeletedComment = require('../../../Domains/comments/entities/DeletedComment');

describe('DeleteCommentUseCase', () => {

  it('should throw error if thread not found', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const deleteCommentPayload = new DeleteComment({
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('thread tidak ditemukan'); });

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(deleteCommentPayload.threadId);
  });

  it('should throw error if comment not found', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const deleteCommentPayload = new DeleteComment({
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('comment tidak ditemukan'); });

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(deleteCommentPayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith(deleteCommentPayload.commentId, deleteCommentPayload.userId);
  });

  it('should throw error if comment not owned by user', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const deleteCommentPayload = new DeleteComment({
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => { throw new AuthorizationError('anda tidak berhak mengakses comment ini'); });

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrow(AuthorizationError);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(deleteCommentPayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith(deleteCommentPayload.commentId, deleteCommentPayload.userId);
  });

  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const deleteCommentPayload = new DeleteComment({
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    });

    const mockSoftDeleteCommentByIdResult = 'comment-123';

    const expectedDeletedComment = new DeletedComment(mockSoftDeleteCommentByIdResult);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = jest.fn().mockResolvedValue();
    mockCommentRepository.softDeleteCommentById = jest.fn().mockResolvedValue(mockSoftDeleteCommentByIdResult);

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const result = await deleteCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(deleteCommentPayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith(deleteCommentPayload.commentId, deleteCommentPayload.userId);
    expect(mockCommentRepository.softDeleteCommentById)
      .toHaveBeenCalledWith(deleteCommentPayload.commentId);
    expect(result).toEqual(expectedDeletedComment);
  });
});
