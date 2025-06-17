const AddThread = require('../AddThread');

describe('a AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      // title: 'Sebuah judul',
      body: 'Ini adalah isi dari sebuah thread',
      userId: 'user-123',
    };

    // Action & Assert
    expect(() => new AddThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: true,
      userId: {},
    };

    // Action & Assert
    expect(() => new AddThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Judul Diskusi',
      body: 'Ini adalah isi dari thread diskusi.',
      userId: 'user-123',
    };

    // Action
    const thread = new AddThread(payload);

    // Assert
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.userId).toEqual(payload.userId);
  });
});
