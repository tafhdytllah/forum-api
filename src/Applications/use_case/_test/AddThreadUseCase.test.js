const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');
const AddThread = require('../../../Domains/threads/entities/AddThread');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      auth: {
        credentials: {
          id: 'user-123',
        },
      },
      payload: {
        title: 'ini title',
        body: 'ini body',
        owner: 'user-123',
      },
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.payload.title,
      owner: useCasePayload.payload.owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(mockAddedThread);

    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      title: useCasePayload.payload.title,
      body: useCasePayload.payload.body,
      owner: useCasePayload.payload.owner,
    }));
  });
});
