const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');
const AddThread = require('../../../Domains/threads/entities/AddThread');

describe('AddThreadUseCase', () => {
  it('should throw error if payload not contain needed property', async () => {

    const useCasePayload = { 
      title: 'ini title',
      // body: 'ini body',
      // userId: 'user-123',
    };
    const addThreadUseCase = new AddThreadUseCase({});

    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type specification', async () => {
    const useCasePayload = { 
      title: 'ini title',
      body: 123,
      userId: ['user-123'],
    };
    const addThreadUseCase = new AddThreadUseCase({});

    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add thread action correctly', async () => {

    const useCasePayload = {
      title: 'ini title',
      body: 'ini body',
      userId: 'user-123',
    };

    const addThreadPayload = new AddThread({
      title: 'ini title',
      body: 'ini body',
      userId: 'user-123',
    });

    const mockAddThreadResult = {
      id: 'thread-123',
      title: 'ini title',
      owner: 'user-123',
    };

    const expectedResult = new AddedThread({
      id: 'thread-123',
      title: 'ini title',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddThreadResult));

    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const result = await getThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.addThread).toBeCalledWith(addThreadPayload);
    expect(result).toStrictEqual(expectedResult);
  });
});
