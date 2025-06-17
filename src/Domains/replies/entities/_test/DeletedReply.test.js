const DeletedReply = require('../DeletedReply');

describe('a DeletedReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    // const payload = {};

    // Action & Assert
    expect(() => new DeletedReply()).toThrowError('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {}

    // Action & Assert
    expect(() => new DeletedReply(payload)).toThrowError('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeletedReply object correctly', () => {
    // Arrange
    const payload = 'reply-123';

    // Action
    const deletedReply = new DeletedReply(payload);

    // Assert
    expect(deletedReply).toBeInstanceOf(DeletedReply);
    expect(deletedReply.id).toEqual(payload);
  });
});