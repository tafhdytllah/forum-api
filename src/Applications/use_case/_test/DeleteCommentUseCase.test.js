const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const DeletedComment = require('../../../Domains/comments/entities/DeletedComment');

describe('DeleteCommentUseCase', () => {
  it('should throw error if payload not contain needed property', async () => {

    const useCasePayload = { 
      threadId: 'thread-123',
      // commentId: 'comment-123',
      // userId: 'user-123',
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({}, {});

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type specification', async () => {
    const useCasePayload = { 
      threadId: ['thread-123'],
      commentId: {},
      userId: 123,
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({}, {});

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
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
