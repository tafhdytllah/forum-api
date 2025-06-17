const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('AddReplyUseCase', () => {

  it('should throw error if thread not found', async () => {
    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'ini content',
    };

    const addReplyPayload = new AddReply({
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'ini content',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('thread tidak ditemukan') });

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(addReplyPayload.threadId);
  });

  it('should throw error if comment not found', async () => {
    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'ini content',
    };

    const addReplyPayload = new AddReply({
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'ini content',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('comment tidak ditemukan'); });

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(addReplyUseCase.execute(useCasePayload))
      .rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(addReplyPayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(addReplyPayload.commentId);
  });

  it('should orchestrating the add reply action correctly', async () => {

    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'ini content',
    };

    const addReplyPayload = new AddReply({
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'ini content',
    });

    const mockAddReplyResult = {
      id: 'reply-123',
      content: 'ini content',
      owner: 'user-123',
    };

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'ini content',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyAvailableComment = jest.fn().mockResolvedValue();
    mockReplyRepository.addReply = jest.fn().mockResolvedValue(mockAddReplyResult);

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const result = await addReplyUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(addReplyPayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment).toHaveBeenCalledWith(addReplyPayload.commentId);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith({
      content: addReplyPayload.content,
      commentId: addReplyPayload.commentId,
      owner: addReplyPayload.userId,
    });

    expect(result).toStrictEqual(expectedAddedReply);
  });
});
