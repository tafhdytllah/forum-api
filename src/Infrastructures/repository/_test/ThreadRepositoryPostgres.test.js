const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const LuxonDateTimeFormatter = require('../../date_time/LuxonDateTimeFormatter');
const { DateTime } = require('luxon');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('AddThread function', () => {
    it('should throw InvariantError when addThread fails to insert data', async () => {
      const addThreadPayload = {
        title: 'title',
        body: 'body',
        userId: 'user-123',
      };

      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
      };
      const fakeIdGenerator = () => '123';
      const fakeDateTimeFormatter = {
        formatDateTime: () => '2024-06-14T00:00:00.000Z',
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        fakePool,
        fakeIdGenerator,
        fakeDateTimeFormatter
      );

      await expect(threadRepositoryPostgres.addThread(addThreadPayload))
        .rejects.toThrow(InvariantError);
    });

    it('should persist add thread and return added thread', async () => {

      const userId = 'user-123';

      await UsersTableTestHelper.addUser({ id: userId });

      const addThreadPayload = {
        title: 'title',
        body: 'body',
        userId: userId,
      };

      const fakeIdGenerator = () => '123';
      const dateTimeFormatter = new LuxonDateTimeFormatter(DateTime);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
        dateTimeFormatter
      );

      const addedThread = await threadRepositoryPostgres.addThread(addThreadPayload);
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');

      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual({
        id: 'thread-123',
        title: addThreadPayload.title,
        owner: addThreadPayload.userId,
      });
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

    it('should throw NotFoundError if thread not available', async () => {
      const getThreadPayloadNotFound = 'thread-404';

      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(fakePool, {}, {});

      await expect(threadRepositoryPostgres.getThread(getThreadPayloadNotFound))
        .rejects
        .toThrow(NotFoundError);
    });

    // it('should return thread with comments and replies', async () => {

    //   await UsersTableTestHelper.addUser({ id: 'user-1' });

    //   await UsersTableTestHelper.addUser({ id: 'user-2' });

    //   await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });

    //   await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-2' });

    //   await RepliesTableTestHelper.addReply({ id: 'reply-999', commentId: 'comment-456', owner: 'user-1', isDeleted: false });

    //   const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

    //   const results = await threadRepositoryPostgres.getThread('thread-123');
    //   console.log(results);

    //   expect(results.length).toEqual(1);
    //   const result = results[0];
    //   expect(result.thread_id).toEqual('thread-123');
    //   expect(result.title).toEqual('Sample Thread');
    //   expect(result.body).toEqual('Sample Body');
    //   expect(result.thread_owner_username).toEqual('user1');
    //   expect(result.comment_id).toEqual('comment-456');
    //   expect(result.comment_content).toEqual('Nice thread!');
    //   expect(result.comment_owner_username).toEqual('user2');
    //   expect(result.comment_is_deleted).toEqual(false);
    //   expect(result.reply_id).toEqual('reply-999');
    //   expect(result.reply_content).toEqual('This is a reply');
    //   expect(result.reply_comment_id).toEqual('comment-456');
    //   expect(result.reply_is_deleted).toEqual(false);
    //   expect(result.reply_owner_username).toEqual('user1');
    // });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when thread is not found', async () => {
      const threadIdNotFound = 'thread-404';
      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(fakePool, {}, {});

      await expect(threadRepositoryPostgres.verifyAvailableThread(threadIdNotFound))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread is found', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({
        id: userId
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      await expect(threadRepositoryPostgres.verifyAvailableThread(threadId))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

});