const DeletedComment = require('../DeletedComment');

describe('a DeletedComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    // const payload = {};

    // Action & Assert
    expect(() => new DeletedComment()).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {}

    // Action & Assert
    expect(() => new DeletedComment(payload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeletedComment object correctly', () => {
    // Arrange
    const payload = 'comment-123';

    // Action
    const deletedComment = new DeletedComment(payload);

    // Assert
    expect(deletedComment.id).toEqual(payload);
  });
});