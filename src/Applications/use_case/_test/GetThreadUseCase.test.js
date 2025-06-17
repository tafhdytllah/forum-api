const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetThreadUseCase', () => {
  it('should throw error if use case payload not contain thread id', async () => {
    // Arrange
    // const useCasePayload = 'thread-123';
    const getThreadUseCase = new GetThreadUseCase({});

    // Action & Assert
    await expect(getThreadUseCase.execute())
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error if thread id not string', async () => {
    // Arrange
    const useCasePayload = 123
    const getThreadUseCase = new GetThreadUseCase({});

    // Action & Assert
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = 'thread-123';

    const mockPostgresRows = [
      {
        thread_id: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        thread_date: '2024-01-01T00:00:00.000+07:00',
        thread_owner_username: 'user1',
        comment_id: 'comment-456',
        comment_content: 'Nice thread!',
        comment_date: '2024-01-01T00:00:00.000+07:00',
        comment_owner_username: 'user2',
        comment_is_deleted: false,
        reply_id: null,
        reply_content: null,
        reply_date: null,
        reply_comment_id: null,
        reply_is_deleted: null,
        reply_owner_username: null,
      }
    ];

    const expectedThread = {
      id: 'thread-123',
      title: 'Sample Thread',
      body: 'Sample Body',
      date: '2024-01-01T00:00:00.000+07:00',
      username: 'user1',
      comments: [
        {
          id: 'comment-456',
          content: 'Nice thread!',
          date: '2024-01-01T00:00:00.000+07:00',
          replies: [],
          username: 'user2',
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThread = jest.fn()
      .mockResolvedValue(mockPostgresRows);

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const result = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThread).toBeCalledWith('thread-123');
    expect(result).toStrictEqual(expectedThread);
  });

  it('should orchestrating the get thread action correctly with replies', async () => {
    // Arrange
    const useCasePayload = 'thread-123';

    const mockPostgresRows = [
      {
        thread_id: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        thread_date: '2024-01-01T00:00:00.000+07:00',
        thread_owner_username: 'user1',
        comment_id: 'comment-456',
        comment_content: 'Nice thread!',
        comment_date: '2024-01-01T00:00:00.000+07:00',
        comment_owner_username: 'user2',
        comment_is_deleted: false,
        reply_id: 'reply-999',
        reply_content: 'This is a reply',
        reply_date: '2024-01-01T00:00:00.000+07:00',
        reply_comment_id: 'comment-456',
        reply_is_deleted: false,
        reply_owner_username: 'user1',
      }
    ];

    const expectedThread = {
      id: 'thread-123',
      title: 'Sample Thread',
      body: 'Sample Body',
      date: '2024-01-01T00:00:00.000+07:00',
      username: 'user1',
      comments: [
        {
          id: 'comment-456',
          content: 'Nice thread!',
          date: '2024-01-01T00:00:00.000+07:00',
          replies: [
            {
              id: 'reply-999',
              content: 'This is a reply',
              date: '2024-01-01T00:00:00.000+07:00',
              commentId: 'comment-456',
              username: 'user1',
            },
          ],
          username: 'user2',
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThread = jest.fn()
      .mockResolvedValue(mockPostgresRows);

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const result = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThread).toBeCalledWith('thread-123');
    expect(result).toStrictEqual(expectedThread);
  });
});
