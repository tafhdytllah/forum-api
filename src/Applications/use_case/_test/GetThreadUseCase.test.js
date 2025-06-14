
const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetThreadUseCase', () => {
  it('should throw error if use case payload not contain thread id', async () => {
    // Arrange
    const useCasePayload = {};
    const getThreadUseCase = new GetThreadUseCase({});

    // Action & Assert
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error if thread id not string', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 123,
    };
    const getThreadUseCase = new GetThreadUseCase({});

    // Action & Assert
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread body',
      date: '2024-01-01T00:00:00.000Z',
      username: 'user1',
      comments: [
        {
          id: 'comment-123',
          username: 'user1',
          date: '2024-01-01T00:00:00.000Z',
          content: 'Comment content',
        }
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThread = jest.fn()
      .mockResolvedValue(expectedThread);

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
