const AddComment = require('../AddComment');

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'ini comment',
      // threadId: 'thread-123',
      // owner: 'user-123',
    };

    // Action & Assert
    expect(() => new AddComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      threadId: {},
      owner: [],
    };

    // Action & Assert
    expect(() => new AddComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Sebuah comment',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const comment = new AddComment(payload);

    // Assert
    expect(comment.content).toEqual(payload.content);
    expect(comment.threadId).toEqual(payload.threadId);
    expect(comment.owner).toEqual(payload.owner);
  });
});
