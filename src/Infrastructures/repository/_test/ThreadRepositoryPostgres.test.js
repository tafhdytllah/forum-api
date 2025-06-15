const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const LuxonDateTimeFormatter = require('../../date_time/LuxonDateTimeFormatter');
const { DateTime } = require('luxon');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('AddThread function', () => {
    it('should persist add thread and return add thread correctly', async () => {

      const fakeIdGenerator = () => '123'; // stub!
      const dateTimeFormatter = new LuxonDateTimeFormatter(DateTime);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator, dateTimeFormatter);

      await UsersTableTestHelper.addUser({
        id: 'user-123'
      });

      const addThread = new AddThread({
        title: 'ini title',
        body: 'ini body',
        owner: 'user-123',
      });

      await threadRepositoryPostgres.addThread({
        title: addThread.title,
        body: addThread.body,
        owner: addThread.owner,
      });

      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');

      expect(threads).toHaveLength(1);
    });

    it('should throw InvariantError when addThread fails to insert', async () => {
      // Arrange
      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
      };
      const fakeIdGenerator = () => '123';
      const fakeDateTimeFormatter = {
        formatDateTime: () => '2024-06-14T00:00:00.000Z',
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(fakePool, fakeIdGenerator, fakeDateTimeFormatter);

      const addThread = {
        title: 'title',
        body: 'body',
        owner: 'user-123',
      };

      // Action & Assert
      await expect(threadRepositoryPostgres.addThread(addThread))
        .rejects
        .toThrowError('thread gagal ditambahkan');
    });
  });

  describe('getThread function', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await RepliesTableTestHelper.cleanTable();
      jest.restoreAllMocks();
    });

    it('should throw NotFoundError when thread is not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      // Mock pool agar hasilnya rowCount = 0
      jest.spyOn(pool, 'query').mockResolvedValue({ rowCount: 0, rows: [] });

      await expect(
        threadRepositoryPostgres.getThread('thread-notfound')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should return thread with comments and replies correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'user2' });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        owner: 'user-1',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        content: 'Nice thread!',
        threadId: 'thread-123',
        owner: 'user-2',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-999',
        content: 'This is a reply',
        commentId: 'comment-456',
        owner: 'user-1',
        isDeleted: false,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      // Act
      const result = await threadRepositoryPostgres.getThread('thread-123');

      // Assert thread
      expect(result.id).toEqual('thread-123');
      expect(result.title).toEqual('Sample Thread');
      expect(result.body).toEqual('Sample Body');
      expect(result.username).toEqual('user1');

      // Assert comments
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0]).toMatchObject({
        id: 'comment-456',
        username: 'user2',
        content: 'Nice thread!',
      });

      // Assert replies
      const replies = result.comments[0].replies;
      expect(replies).toHaveLength(1);
      expect(replies[0]).toMatchObject({
        id: 'reply-999',
        content: 'This is a reply',
        username: 'user1',
      });
    });

    it('should return **komentar telah dihapus** and **balasan telah dihapus** if is_deleted = true', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'user2' });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Thread with Deleted',
        body: 'Body here',
        owner: 'user-1',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        content: 'original comment',
        threadId: 'thread-123',
        owner: 'user-2',
        isDeleted: true,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-789',
        content: 'original reply',
        commentId: 'comment-456',
        owner: 'user-1',
        isDeleted: true,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      // Act
      const result = await threadRepositoryPostgres.getThread('thread-123');

      const comment = result.comments.find(c => c.id === 'comment-456');
      expect(comment.content).toBe('**komentar telah dihapus**');

      const reply = comment.replies.find(r => r.id === 'reply-789');
      expect(reply.content).toBe('**balasan telah dihapus**');
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when thread is not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      await expect(threadRepositoryPostgres.verifyAvailableThread('thread-404'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread is found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user123' });

      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      // Act & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThread('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

});