const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');
const AddComment = require('../../../Domains/comments/entities/AddComment');

describe('AddCommentUseCase', () => {
  it('should throw error if payload not contain needed property', async () => {

    const useCasePayload = {
      userId: 'user-123',
      // threadId: 'thread-123',
      // content: 'ini content',
    };
    const addCommentUseCase = new AddCommentUseCase({}, {});

    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type specification', async () => {
    const useCasePayload = {
      userId: 123,
      threadId: {},
      content: [],
    };
    const addCommentUseCase = new AddCommentUseCase({}, {});

    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
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
