const AddCommentLike = require('../AddCommentLike');

describe('a AddCommentLike entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      // userId: 'user-123',
      commentId: 'comment-123',
    };

    expect(() => new AddCommentLike(payload)).toThrowError('ADD_COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {

    const payload = {
      userId: {},
      commentId: 123,
    };

    expect(() => new AddCommentLike(payload)).toThrowError('ADD_COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddCommentLike object correctly', () => {

    const payload = {
      userId: 'user-123',
      commentId: 'comment-123',
    };
    const addCommentLike = new AddCommentLike(payload);

    expect(addCommentLike.userId).toEqual(payload.userId);
    expect(addCommentLike.commentId).toEqual(payload.commentId);
  });
});
