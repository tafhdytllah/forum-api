const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const LuxonDateTimeFormatter = require('../../date_time/LuxonDateTimeFormatter');
const { DateTime } = require('luxon');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('AddCommentLike function', () => {

    it('should throw InvariantError when addCommentLike fails to insert data', async () => {
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const fakeIdGenerator = () => '123';
      const fakeDateTimeFormatter = {
        formatDateTime: () => '2025-05-15T22:00:00+07:00',
      };

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
        fakeDateTimeFormatter
      );

      await expect(commentLikeRepositoryPostgres.addCommentLike(payload.userId, payload.commentId))
        .rejects.toThrow(InvariantError);
    });

    it('should persist add comment like', async () => {

      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const payload = {
        userId: userId,
        commentId: commentId,
      };

      const fakeIdGenerator = () => '123';
      const dateTimeFormatter = new LuxonDateTimeFormatter(DateTime);
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
        dateTimeFormatter
      );

      const addedCommentLikes = await commentLikeRepositoryPostgres.addCommentLike(payload.userId, payload.commentId);

      const commentLike = await CommentLikesTableTestHelper.findCommentLike(userId, commentId);

      expect(addedCommentLikes).toEqual('comment-like-123');
      expect(commentLike).toHaveLength(1);
      expect(commentLike[0]).toMatchObject({
        id: 'comment-like-123',
        user_id: userId,
        comment_id: commentId,
      });
      expect(commentLike[0].created_at).toBeDefined();
      expect(commentLike[0].updated_at).toBeDefined();

    });
  });

  describe('deleteCommentLike function', () => {
    it('should throw InvariantError if comment like fails to delete', async () => {
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {}, {});

      await expect(commentLikeRepositoryPostgres.deleteCommentLike(payload.userId, payload.commentId))
        .rejects
        .toThrow(InvariantError);
    });

    it('should delete comment like correctly', async () => {

      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentLikeId = 'comment-like-123';
      const payload = {
        userId: userId,
        commentId: commentId,
      };

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await CommentLikesTableTestHelper.addCommentLike({ id: commentLikeId, user_id: userId, comment_id: commentId });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {}, {});

      const deletedCommentLikeId = await commentLikeRepositoryPostgres.deleteCommentLike(payload.userId, payload.commentId);
      const remainingCommentLikes = await CommentLikesTableTestHelper.findCommentLike(userId, commentId);

      expect(deletedCommentLikeId).toEqual(commentLikeId);
      expect(remainingCommentLikes).toHaveLength(0);
    });
  });

  describe('isLiked function', () => {

    it('should return false when comment like is not found', async () => {
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {}, {});

      const isLiked = await commentLikeRepositoryPostgres.isLiked(payload.userId, payload.commentId);

      expect(isLiked).toBe(false);
    });

    it('should return true when comment like is found', async () => {
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };

      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {}, {});

      await CommentLikesTableTestHelper.addCommentLike(payload.userId, payload.commentId);

      const isLiked = await commentLikeRepositoryPostgres.isLiked(payload.userId, payload.commentId);

      expect(isLiked).toBe(true);
    });
  });
  
});