const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const LuxonDateTimeFormatter = require('../../date_time/LuxonDateTimeFormatter');
const { DateTime } = require('luxon');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
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
    it('should throw InvariantError if reply not added', async () => {
      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }), // Simulasi gagal insert
      };

      const fakeIdGenerator = () => '123';
      const fakeDateTimeFormatter = {
        formatDateTime: () => '2025-01-01T00:00:00.000Z',
      };

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        fakePool,
        fakeIdGenerator,
        fakeDateTimeFormatter
      );

      const fakeReplyPayload = {
        content: 'a reply',
        commentId: 'comment-123',
        owner: 'user-123',
      };

      await expect(replyRepositoryPostgres.addReply(fakeReplyPayload))
        .rejects.toThrow(InvariantError);
    });

    it('should persist add reply and return add reply correctly', async () => {

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sebuah thread',
        body: 'Isi dari thread',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'ini comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const addReply = new AddReply({
        content: 'ini reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const dateTimeFormatter = new LuxonDateTimeFormatter(DateTime);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator, dateTimeFormatter);

      await replyRepositoryPostgres.addReply(addReply);

      const reply = await RepliesTableTestHelper.findReplyById('reply-123');

      expect(reply).toHaveLength(1);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw InvariantError if reply not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Act & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-not-found', 'user-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if reply not owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'john',
        password: 'secret_password',
        fullname: 'John Doe',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sebuah thread',
        body: 'Isi dari thread',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'ini comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'ini reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Act & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456')
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw error if reply is owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sebuah thread',
        body: 'Isi dari thread',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'ini comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'ini reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // Act & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')
      ).resolves.not.toThrow();
    });
  });


  describe('softDeletReplyById', () => {
    it('should throw InvariantError if reply not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      await expect(replyRepositoryPostgres.softDeleteReplyById('reply-123'))
        .rejects.toThrow(InvariantError);
    });

    it('should soft delete reply correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      })

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sebuah thread',
        body: 'Isi dari thread',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'ini comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'ini reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      await replyRepositoryPostgres.softDeleteReplyById('reply-123');

      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
      expect(reply[0].is_deleted).toBe(true);
    });
  })
});