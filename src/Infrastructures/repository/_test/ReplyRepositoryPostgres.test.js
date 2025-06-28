const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const LuxonDateTimeFormatter = require('../../date_time/LuxonDateTimeFormatter');
const { DateTime } = require('luxon');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should throw InvariantError when addReply fails to insert data', async () => {
      const addReplyPayload = {
        content: 'a reply',
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const fakeIdGenerator = () => '123';
      const fakeDateTimeFormatter = {
        formatDateTime: () => '2025-05-15T22:00:00+07:00',
      };

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
        fakeDateTimeFormatter
      );

      await expect(replyRepositoryPostgres.addReply(addReplyPayload))
        .rejects.toThrow(InvariantError);
    });

    it('should persist add reply and return added reply', async () => {

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const addReplyPayload = {
        content: 'a reply',
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const fakeIdGenerator = () => '123';
      const dateTimeFormatter = new LuxonDateTimeFormatter(DateTime);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
        dateTimeFormatter
      );

      const addedReply = await replyRepositoryPostgres.addReply(addReplyPayload);
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');

      expect(reply).toHaveLength(1);
      expect(addedReply).toStrictEqual({
        id: 'reply-123',
        content: addReplyPayload.content,
        owner: addReplyPayload.userId,
      });
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError if reply not available', async () => {
      const verifyReplyOwnerPayload = {
        replyId: 'reply-123',
        userId: 'user-123',
      };

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner(verifyReplyOwnerPayload.replyId, verifyReplyOwnerPayload.userId))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if reply not owned by user', async () => {

      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', owner: 'user-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', owner: 'user-2' });
      await RepliesTableTestHelper.addReply({ id: 'reply-1', commentId: 'comment-1', owner: 'user-1' });

      const verifyReplyOwnerPayload = {
        replyId: 'reply-1',
        userId: 'user-12',
      };

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner(verifyReplyOwnerPayload.replyId, verifyReplyOwnerPayload.userId))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should not throw error if reply is owned by user', async () => {
      const verifyReplyOwnerPayload = {
        replyId: 'reply-123',
        userId: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      await expect(
        replyRepositoryPostgres.verifyReplyOwner(verifyReplyOwnerPayload.replyId, verifyReplyOwnerPayload.userId)
      ).resolves.not.toThrow(NotFoundError);
      await expect(
        replyRepositoryPostgres.verifyReplyOwner(verifyReplyOwnerPayload.replyId, verifyReplyOwnerPayload.userId)
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('softDeletReplyById', () => {
    it('should throw InvariantError if reply fails to soft delete', async () => {
      const softDeleteReplyByIdPayload = 'reply-404';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      await expect(replyRepositoryPostgres.softDeleteReplyById(softDeleteReplyByIdPayload))
        .rejects
        .toThrow(InvariantError);
    });

    it('should soft delete reply correctly and return id of deleted reply', async () => {
      const replyIdToDelete = 'reply-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: replyIdToDelete, commentId: 'comment-123', owner: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      const deletedReplyId = await replyRepositoryPostgres.softDeleteReplyById(replyIdToDelete);
      const reply = await RepliesTableTestHelper.findReplyById(replyIdToDelete);

      expect(reply).toHaveLength(1);
      expect(reply[0].is_deleted).toBe(true);
      expect(deletedReplyId).toStrictEqual(replyIdToDelete);
    });
  })
});