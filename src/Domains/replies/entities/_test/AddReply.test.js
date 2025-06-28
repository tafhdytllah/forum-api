const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'ini reply',
      commentId: 'comment-123',
      // userId missing
      // threadId missing
    };

    // Action & Assert
    expect(() => new AddReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      commentId: {},
      userId: [],
      threadId: {},
    };

    // Action & Assert
    expect(() => new AddReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'Sebuah reply',
      commentId: 'comment-123',
      userId: 'user-123',
      threadId: 'thread-123',
    };

    // Action
    const addReply = new AddReply(payload);

    // Assert
    expect(addReply.content).toEqual(payload.content);
    expect(addReply.commentId).toEqual(payload.commentId);
    expect(addReply.userId).toEqual(payload.userId);
    expect(addReply.threadId).toEqual(payload.threadId);
  });
});
