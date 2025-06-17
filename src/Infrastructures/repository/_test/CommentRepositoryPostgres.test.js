const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const LuxonDateTimeFormatter = require('../../date_time/LuxonDateTimeFormatter');
const { DateTime } = require('luxon');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should throw InvariantError when addComment fails to insert data', async () => {
      const addCommentPayload = {
        content: 'a content',
        threadId: 'thread-123',
        userId: 'user-123',
      };

      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
      };
      const fakeIdGenerator = () => '123';
      const fakeDateTimeFormatter = {
        formatDateTime: () => '2025-01-01T00:00:00.000Z',
      };
      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        fakePool,
        fakeIdGenerator,
        fakeDateTimeFormatter
      );

      await expect(commentRepositoryPostgres.addComment(addCommentPayload))
        .rejects.toThrow(InvariantError);
    });

    it('should persist add comment and return added comment', async () => {

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const addCommentPayload = {
        content: 'a content',
        threadId: 'thread-123',
        userId: 'user-123',
      };

      const fakeIdGenerator = () => '123';
      const dateTimeFormatter = new LuxonDateTimeFormatter(DateTime);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        dateTimeFormatter
      );

      const addComment = await commentRepositoryPostgres.addComment(addCommentPayload);
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');

      expect(comment).toHaveLength(1);
      expect(addComment).toStrictEqual({
        id: 'comment-123',
        content: addCommentPayload.content,
        owner: addCommentPayload.userId,
      });
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      const verifyCommentOwnerPayload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(fakePool, {}, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner(verifyCommentOwnerPayload.commentId, verifyCommentOwnerPayload.userId))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if comment not owned by user', async () => {
      const verifyCommentOwnerPayload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const fakePool = {
        query: jest.fn().mockResolvedValue({
          rowCount: 1,
          rows: [{ owner: 'user-403' }] // owner yang berbeda 
        }),
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(fakePool, {}, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner(verifyCommentOwnerPayload.commentId, verifyCommentOwnerPayload.userId))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should not throw error if comment is owned by user', async () => {
      const verifyCommentOwnerPayload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      await expect(
        commentRepositoryPostgres.verifyCommentOwner(verifyCommentOwnerPayload.commentId, verifyCommentOwnerPayload.userId)
      ).resolves.not.toThrow(NotFoundError);
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(verifyCommentOwnerPayload.commentId, verifyCommentOwnerPayload.userId)
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('verifyAvailableComment function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      const commentIdNotFoundPayload = 'comment-404';
      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(fakePool, {}, {});

      await expect(commentRepositoryPostgres.verifyAvailableComment(commentIdNotFoundPayload))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when comment is found', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({
        id: userId
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      await expect(commentRepositoryPostgres.verifyAvailableComment(commentId))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('softDeleteCommentById function', () => {
    it('should throw InvariantError if comment fails to soft delete', async () => {
      const softDeleteCommentByIdPayload = 'comment-123';

      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(fakePool, {}, {});

      await expect(commentRepositoryPostgres.softDeleteCommentById(softDeleteCommentByIdPayload))
        .rejects
        .toThrow(InvariantError);
    });

    it('should soft delete comment correctly and return id of deleted comment', async () => {
      const commentIdToDelete = 'comment-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      const deletedCommentId = await commentRepositoryPostgres.softDeleteCommentById(commentIdToDelete);
      const comment = await CommentsTableTestHelper.findCommentsById(commentIdToDelete);

      expect(comment).toHaveLength(1);
      expect(comment[0].is_deleted).toBe(true);
      expect(deletedCommentId).toStrictEqual(commentIdToDelete);
    });
  })
});