const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const DeleteReply = require('../../../Domains/replies/entities/DeleteReply');
const DeletedReply = require('../../../Domains/replies/entities/DeletedReply');

describe('DeleteReplyUseCase', () => {

  it('should throw error if thread not found', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const deleteReplyPayload = new DeleteReply({
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('thread tidak ditemukan'); });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(deleteReplyPayload.threadId);
  });

  it('should throw error if comment not found', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const deleteReplyPayload = new DeleteReply({
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('comment tidak ditemukan'); });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(deleteReplyPayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(deleteReplyPayload.commentId);
  });

  it('should throw error if reply not found', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const deleteReplyPayload = new DeleteReply({
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyAvailableComment = jest.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('reply tidak ditemukan'); });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(deleteReplyPayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(deleteReplyPayload.commentId);
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(deleteReplyPayload.replyId, deleteReplyPayload.userId);
  });

  it('should throw error if reply not owned by user', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const deleteReplyPayload = new DeleteReply({
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyAvailableComment = jest.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => { throw new AuthorizationError('anda tidak berhak mengakses reply ini'); });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects.toThrow(AuthorizationError);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(deleteReplyPayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(deleteReplyPayload.commentId);
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(deleteReplyPayload.replyId, deleteReplyPayload.userId);
  });

  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const deleteReplyPayload = new DeleteReply({
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    });

    const mockSoftDeleteReplyByIdResult = "reply-123";

    const expectedDeletedReplyId = new DeletedReply(mockSoftDeleteReplyByIdResult);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyAvailableComment = jest.fn().mockResolvedValue();
    mockReplyRepository.verifyReplyOwner = jest.fn().mockResolvedValue();
    mockReplyRepository.softDeleteReplyById = jest.fn().mockResolvedValue(mockSoftDeleteReplyByIdResult);

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const result = await deleteReplyUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(deleteReplyPayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(deleteReplyPayload.commentId);
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(deleteReplyPayload.replyId, deleteReplyPayload.userId);
    expect(mockReplyRepository.softDeleteReplyById)
      .toHaveBeenCalledWith(deleteReplyPayload.replyId);
    expect(result).toEqual(expectedDeletedReplyId);
  });
});
