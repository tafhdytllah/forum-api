const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetThreadUseCase', () => {
  it('should throw error if use case payload not contain thread id', async () => {
    const getThreadUseCase = new GetThreadUseCase({});
    await expect(getThreadUseCase.execute())
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error if thread id not string', async () => {
    const useCasePayload = 123;
    const getThreadUseCase = new GetThreadUseCase({});
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrate the get thread action correctly (no replies, no likes)', async () => {
    const useCasePayload = 'thread-123';

    const mockPostgresRows = [
      {
        thread_id: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        thread_date: '2025-05-15T22:00:00+07:00',
        thread_owner_username: 'user1',

        comment_id: 'comment-456',
        comment_content: 'Nice thread!',
        comment_date: '2025-05-15T22:00:00+07:00',
        comment_owner_username: 'user2',
        comment_is_deleted: false,

        reply_id: null,
        reply_content: null,
        reply_date: null,
        reply_comment_id: null,
        reply_is_deleted: null,
        reply_owner_username: null,

        like_id: null,
        like_comment_id: null,
        like_count: 0,
      },
    ];

    const expectedThread = {
      id: 'thread-123',
      title: 'Sample Thread',
      body: 'Sample Body',
      date: '2025-05-15T22:00:00+07:00',
      username: 'user1',
      comments: [
        {
          id: 'comment-456',
          content: 'Nice thread!',
          date: '2025-05-15T22:00:00+07:00',
          replies: [],
          username: 'user2',
          likeCount: 0,
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThread = jest.fn().mockResolvedValue(mockPostgresRows);

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const result = await getThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.getThread).toBeCalledWith(useCasePayload);
    expect(result).toMatchObject(expectedThread);
  });

  it('should orchestrate the get thread action correctly with replies and like count', async () => {
    const useCasePayload = 'thread-123';

    const mockPostgresRows = [
      {
        thread_id: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        thread_date: '2025-05-15T22:00:00+07:00',
        thread_owner_username: 'user1',

        comment_id: 'comment-456',
        comment_content: 'Nice thread!',
        comment_date: '2025-05-15T22:00:00+07:00',
        comment_owner_username: 'user2',
        comment_is_deleted: false,

        reply_id: 'reply-999',
        reply_content: 'This is a reply',
        reply_date: '2025-05-15T23:00:00+07:00',
        reply_comment_id: 'comment-456',
        reply_is_deleted: false,
        reply_owner_username: 'user1',

        like_id: 'like-001',
        like_comment_id: 'comment-456',
        like_count: 1,
      },
    ];

    const expectedThread = {
      id: 'thread-123',
      title: 'Sample Thread',
      body: 'Sample Body',
      date: '2025-05-15T22:00:00+07:00',
      username: 'user1',
      comments: [
        {
          id: 'comment-456',
          content: 'Nice thread!',
          date: '2025-05-15T22:00:00+07:00',
          username: 'user2',
          likeCount: 1,
          replies: [
            {
              id: 'reply-999',
              content: 'This is a reply',
              date: '2025-05-15T23:00:00+07:00',
              commentId: 'comment-456',
              username: 'user1',
            },
          ],
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThread = jest.fn().mockResolvedValue(mockPostgresRows);

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const result = await getThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.getThread).toBeCalledWith(useCasePayload);
    expect(result).toMatchObject(expectedThread);
  });
});
