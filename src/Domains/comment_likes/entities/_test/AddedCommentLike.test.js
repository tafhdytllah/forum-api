const AddedCommentLike = require('../AddedCommentLike');

describe('a AddedCommentLike entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      // id: 'comment-like-123',
    };

    expect(() => new AddedCommentLike(payload)).toThrowError('ADD_COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
    };

    expect(() => new AddedCommentLike(payload)).toThrowError('ADD_COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedCommentLike object correctly', () => {

    const payload = {
      id: 'comment-like-123',
    };

    const addedCommentLike = new AddedCommentLike(payload);

    expect(addedCommentLike.id).toEqual(payload.id);
  });
});
