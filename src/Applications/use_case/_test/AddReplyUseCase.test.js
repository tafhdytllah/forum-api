const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');

describe('AddReplyUseCase', () => {
  it('should throw error if payload not contain needed property', async () => {

    const useCasePayload = { 
      userId: 'user-123',
      threadId: 'thread-123',
      // commentId: 'comment-123',
      // content: 'ini content',
    };
    const addReplyUseCase = new AddReplyUseCase({}, {}, {});

    await expect(addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type specification', async () => {
    const useCasePayload = { 
      userId: ['user-123'],
      threadId: {},
      commentId: 12345,
      content: 'ini content',
    };
    const addReplyUseCase = new AddReplyUseCase({}, {}, {});

    await expect(addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
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
      userId: addReplyPayload.userId,
    });

    expect(result).toStrictEqual(expectedAddedReply);
  });
});
