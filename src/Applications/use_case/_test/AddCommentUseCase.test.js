const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('AddCommentUseCase', () => {

  it('should throw error if thread not found', async () => {
    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      content: 'ini content',
    };

    const addCommentPayload = new AddComment({
      content: 'ini content',
      threadId: 'thread-123',
      userId: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('thread tidak ditemukan') });

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(addCommentPayload.threadId);
  });

  it('should orchestrating the add comment action correctly', async () => {

    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      content: 'ini content',
    };

    const addCommentPayload = new AddComment({
      content: 'ini content',
      threadId: 'thread-123',
      userId: 'user-123',
    });

    const addCommentResult = {
      id: 'comment-123',
      content: 'ini content',
      owner: 'user-123',
    };

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'ini content',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();
    mockCommentRepository.addComment = jest.fn().mockResolvedValue(addCommentResult);

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const result = await addCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(addCommentPayload.threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(addCommentPayload);

    expect(result).toStrictEqual(expectedAddedComment);
  });
});
