const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const DeleteReply = require('../../../Domains/replies/entities/DeleteReply');
const DeletedReply = require('../../../Domains/replies/entities/DeletedReply');

describe('DeleteReplyUseCase', () => {

  it('should throw error if payload not contain needed property', async () => {

    const useCasePayload = { 
      threadId: 'thread-123', 
      // commentId: 'comment-123',
      // replyId: 'reply-123', 
      // userId: 'user-123',
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({}, {}, {});

    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type specification', async () => {
    const useCasePayload = { 
      threadId: {}, 
      commentId: 123,
      replyId: ['reply-123'], 
      userId: [],
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({}, {}, {});

    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
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
