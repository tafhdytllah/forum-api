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

    it('should return thread rows without comments and without replies', async () => {
      const getThreadPayload = {
        threadId: 'thread-123',
      };

      const expectedResult = {
        threadId: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        threadDate: '2024-06-17T01:01:00.00.000Z',
        threadOwnerUsername: 'user123',
        commentId: null,
        commentContent: null,
        commentDate: null,
        commentOwnerUsername: null,
        commentIsDeleted: null,
        replyId: null,
        replyContent: null,
        replyDate: null,
        replyComment_id: null,
        replyIsDeleted: null,
        replyOwnerUsername: null,
      };

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user123' });

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Sample Thread', body: 'Sample Body', owner: 'user-123', date: '2024-06-17T01:01:00.000Z' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      const results = await threadRepositoryPostgres.getThread(getThreadPayload.threadId);

      expect(results.length).toEqual(1);
      const result = results[0];

      expect(result.thread_id).toEqual(expectedResult.threadId);
      expect(result.title).toEqual(expectedResult.title);
      expect(result.body).toEqual(expectedResult.body);
      expect(result.thread_owner_username).toEqual(expectedResult.threadOwnerUsername);
      expect(result.comment_id).toBeNull();
      expect(result.comment_content).toBeNull();
      expect(result.comment_date).toBeNull();
      expect(result.comment_owner_username).toBeNull();
      expect(result.comment_is_deleted).toBeNull();
      expect(result.reply_id).toBeNull();
      expect(result.reply_content).toBeNull();
      expect(result.reply_date).toBeNull();
      expect(result.reply_comment_id).toBeNull();
      expect(result.reply_is_deleted).toBeNull();
      expect(result.reply_owner_username).toBeNull();
    });

    it('should return thread rows with comments is not deleted and without replies', async () => {
      const getThreadPayload = {
        threadId: 'thread-123',
      };

      const expectedResult = [{
        threadId: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        threadDate: '2024-06-17T01:01:00.00.000Z',
        threadOwnerUsername: 'user111',
        commentId: 'comment-1',
        commentContent: 'Sample Comment 1',
        commentDate: '2024-06-17T11:11:00.00.000Z',
        commentOwnerUsername: 'user222',
        commentIsDeleted: false,
        replyId: null,
        replyContent: null,
        replyDate: null,
        replyComment_id: null,
        replyIsDeleted: null,
        replyOwnerUsername: null,
      },
      {
        threadId: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        threadDate: '2024-06-17T01:01:00.00.000Z',
        threadOwnerUsername: 'user111',
        commentId: 'comment-2',
        commentContent: 'Sample Comment 2',
        commentDate: '2024-06-17T22:22:00.00.000Z',
        commentOwnerUsername: 'user333',
        commentIsDeleted: false,
        replyId: null,
        replyContent: null,
        replyDate: null,
        replyComment_id: null,
        replyIsDeleted: null,
        replyOwnerUsername: null,
      }];

      await UsersTableTestHelper.addUser({ id: 'user-111', username: 'user111' });
      await UsersTableTestHelper.addUser({ id: 'user-222', username: 'user222' });
      await UsersTableTestHelper.addUser({ id: 'user-333', username: 'user333' });

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Sample Thread', body: 'Sample Body', owner: 'user-111', date: '2024-06-17T01:01:00.000Z' });

      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-123', content: 'Sample Comment 1', owner: 'user-222', date: '2024-06-17T11:11:00.00.000Z' });
      await CommentsTableTestHelper.addComment({ id: 'comment-2', threadId: 'thread-123', content: 'Sample Comment 2', owner: 'user-333', date: '2024-06-17T22:22:00.00.000Z' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      const results = await threadRepositoryPostgres.getThread(getThreadPayload.threadId);

      expect(results.length).toEqual(2);

      const result = results[0];
      expect(result.thread_id).toEqual(expectedResult[0].threadId);
      expect(result.title).toEqual(expectedResult[0].title);
      expect(result.body).toEqual(expectedResult[0].body);
      expect(result.thread_owner_username).toEqual(expectedResult[0].threadOwnerUsername);
      expect(result.comment_id).toEqual(expectedResult[0].commentId);
      expect(result.comment_content).toEqual(expectedResult[0].commentContent);
      expect(result.comment_date).toEqual(expectedResult[0].commentDate);
      expect(result.comment_owner_username).toEqual(expectedResult[0].commentOwnerUsername);
      expect(result.comment_is_deleted).toEqual(expectedResult[0].commentIsDeleted);
      expect(result.reply_id).toBeNull();
      expect(result.reply_content).toBeNull();
      expect(result.reply_date).toBeNull();
      expect(result.reply_comment_id).toBeNull();
      expect(result.reply_is_deleted).toBeNull();
      expect(result.reply_owner_username).toBeNull();

      const result2 = results[1];
      expect(result2.thread_id).toEqual(expectedResult[1].threadId);
      expect(result2.title).toEqual(expectedResult[1].title);
      expect(result2.body).toEqual(expectedResult[1].body);
      expect(result2.thread_owner_username).toEqual(expectedResult[1].threadOwnerUsername);
      expect(result2.comment_id).toEqual(expectedResult[1].commentId);
      expect(result2.comment_content).toEqual(expectedResult[1].commentContent);
      expect(result2.comment_date).toEqual(expectedResult[1].commentDate);
      expect(result2.comment_owner_username).toEqual(expectedResult[1].commentOwnerUsername);
      expect(result2.comment_is_deleted).toEqual(expectedResult[1].commentIsDeleted);
      expect(result2.reply_id).toBeNull();
      expect(result2.reply_content).toBeNull();
      expect(result2.reply_date).toBeNull();
      expect(result2.reply_comment_id).toBeNull();
      expect(result2.reply_is_deleted).toBeNull();
      expect(result2.reply_owner_username).toBeNull();
    });

    it('should return thread rows with comments deleted and without replies', async () => {
      const getThreadPayload = {
        threadId: 'thread-123',
      };

      const expectedResult = [{
        threadId: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        threadDate: '2024-06-17T01:01:00.00.000Z',
        threadOwnerUsername: 'user111',
        commentId: 'comment-1',
        commentContent: 'Sample Comment 1',
        commentDate: '2024-06-17T11:11:00.00.000Z',
        commentOwnerUsername: 'user222',
        commentIsDeleted: true,
        replyId: null,
        replyContent: null,
        replyDate: null,
        replyComment_id: null,
        replyIsDeleted: null,
        replyOwnerUsername: null,
      },
      {
        threadId: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        threadDate: '2024-06-17T01:01:00.00.000Z',
        threadOwnerUsername: 'user111',
        commentId: 'comment-2',
        commentContent: 'Sample Comment 2',
        commentDate: '2024-06-17T22:22:00.00.000Z',
        commentOwnerUsername: 'user333',
        commentIsDeleted: false,
        replyId: null,
        replyContent: null,
        replyDate: null,
        replyComment_id: null,
        replyIsDeleted: null,
        replyOwnerUsername: null,
      }];

      await UsersTableTestHelper.addUser({ id: 'user-111', username: 'user111' });
      await UsersTableTestHelper.addUser({ id: 'user-222', username: 'user222' });
      await UsersTableTestHelper.addUser({ id: 'user-333', username: 'user333' });

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Sample Thread', body: 'Sample Body', owner: 'user-111', date: '2024-06-17T01:01:00.000Z' });

      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-123', content: 'Sample Comment 1', owner: 'user-222', isDeleted: true, date: '2024-06-17T11:11:00.00.000Z' });
      await CommentsTableTestHelper.addComment({ id: 'comment-2', threadId: 'thread-123', content: 'Sample Comment 2', owner: 'user-333', isDeleted: false, date: '2024-06-17T22:22:00.00.000Z' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      const results = await threadRepositoryPostgres.getThread(getThreadPayload.threadId);

      expect(results.length).toEqual(2);

      const result = results[0];
      expect(result.thread_id).toEqual(expectedResult[0].threadId);
      expect(result.title).toEqual(expectedResult[0].title);
      expect(result.body).toEqual(expectedResult[0].body);
      expect(result.thread_owner_username).toEqual(expectedResult[0].threadOwnerUsername);
      expect(result.comment_id).toEqual(expectedResult[0].commentId);
      expect(result.comment_content).toEqual(expectedResult[0].commentContent);
      expect(result.comment_date).toEqual(expectedResult[0].commentDate);
      expect(result.comment_owner_username).toEqual(expectedResult[0].commentOwnerUsername);
      expect(result.comment_is_deleted).toEqual(expectedResult[0].commentIsDeleted);
      expect(result.reply_id).toBeNull();
      expect(result.reply_content).toBeNull();
      expect(result.reply_date).toBeNull();
      expect(result.reply_comment_id).toBeNull();
      expect(result.reply_is_deleted).toBeNull();
      expect(result.reply_owner_username).toBeNull();

      const result2 = results[1];
      expect(result2.thread_id).toEqual(expectedResult[1].threadId);
      expect(result2.title).toEqual(expectedResult[1].title);
      expect(result2.body).toEqual(expectedResult[1].body);
      expect(result2.thread_owner_username).toEqual(expectedResult[1].threadOwnerUsername);
      expect(result2.comment_id).toEqual(expectedResult[1].commentId);
      expect(result2.comment_content).toEqual(expectedResult[1].commentContent);
      expect(result2.comment_date).toEqual(expectedResult[1].commentDate);
      expect(result2.comment_owner_username).toEqual(expectedResult[1].commentOwnerUsername);
      expect(result2.comment_is_deleted).toEqual(expectedResult[1].commentIsDeleted);
      expect(result2.reply_id).toBeNull();
      expect(result2.reply_content).toBeNull();
      expect(result2.reply_date).toBeNull();
      expect(result2.reply_comment_id).toBeNull();
      expect(result2.reply_is_deleted).toBeNull();
      expect(result2.reply_owner_username).toBeNull();
    });

    it('should return thread rows with comments and replies is not deleted', async () => {
      const getThreadPayload = {
        threadId: 'thread-123',
      };

      const expectedResult = [
        {
          threadId: 'thread-123',
          title: 'Sample Thread',
          body: 'Sample Body',
          threadDate: '2024-06-17T01:01:00.00.000Z',
          threadOwnerUsername: 'user111',
          commentId: 'comment-1',
          commentContent: 'Sample Comment 1',
          commentDate: '2024-06-17T11:11:00.00.000Z',
          commentOwnerUsername: 'user222',
          commentIsDeleted: false,
          replyId: 'reply-2',
          replyContent: 'Sample Reply 2',
          replyDate: '2024-06-17T23:23:00.00.000Z',
          replyComment_id: 'comment-1',
          replyIsDeleted: false,
          replyOwnerUsername: 'user222',
        },
        {
          threadId: 'thread-123',
          title: 'Sample Thread',
          body: 'Sample Body',
          threadDate: '2024-06-17T01:01:00.00.000Z',
          threadOwnerUsername: 'user111',
          commentId: 'comment-1',
          commentContent: 'Sample Comment 1',
          commentDate: '2024-06-17T11:11:00.00.000Z',
          commentOwnerUsername: 'user222',
          commentIsDeleted: false,
          replyId: 'reply-1',
          replyContent: 'Sample Reply 1',
          replyDate: '2024-06-17T22:22:00.00.000Z',
          replyComment_id: 'comment-1',
          replyIsDeleted: false,
          replyOwnerUsername: 'user111',
        },
        {
          threadId: 'thread-123',
          title: 'Sample Thread',
          body: 'Sample Body',
          threadDate: '2024-06-17T01:01:00.00.000Z',
          threadOwnerUsername: 'user111',
          commentId: 'comment-2',
          commentContent: 'Sample Comment 2',
          commentDate: '2024-06-17T10:10:00.00.000Z',
          commentOwnerUsername: 'user333',
          commentIsDeleted: false,
          replyId: null,
          replyContent: null,
          replyDate: null,
          replyComment_id: null,
          replyIsDeleted: null,
          replyOwnerUsername: null,
        },
      ];

      await UsersTableTestHelper.addUser({ id: 'user-111', username: 'user111' });
      await UsersTableTestHelper.addUser({ id: 'user-222', username: 'user222' });
      await UsersTableTestHelper.addUser({ id: 'user-333', username: 'user333' });

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Sample Thread', body: 'Sample Body', owner: 'user-111', date: '2024-06-17T01:01:00.00.000Z' });

      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-123', content: 'Sample Comment 1', owner: 'user-222', isDeleted: false, date: '2024-06-17T11:11:00.00.000Z' });
      await CommentsTableTestHelper.addComment({ id: 'comment-2', threadId: 'thread-123', content: 'Sample Comment 2', owner: 'user-333', isDeleted: false, date: '2024-06-17T10:10:00.00.000Z' });

      await RepliesTableTestHelper.addReply({ id: 'reply-1', commentId: 'comment-1', content: 'Sample Reply 1', owner: 'user-111', isDeleted: false, date: '2024-06-17T22:22:00.00.000Z' });
      await RepliesTableTestHelper.addReply({ id: 'reply-2', commentId: 'comment-1', content: 'Sample Reply 2', owner: 'user-222', isDeleted: false, date: '2024-06-17T23:23:00.00.000Z' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      const results = await threadRepositoryPostgres.getThread(getThreadPayload.threadId);

      expect(results.length).toEqual(3);

      const result = results[0];
      expect(result.thread_id).toEqual(expectedResult[0].threadId);
      expect(result.title).toEqual(expectedResult[0].title);
      expect(result.body).toEqual(expectedResult[0].body);
      expect(result.thread_owner_username).toEqual(expectedResult[0].threadOwnerUsername);
      expect(result.comment_id).toEqual(expectedResult[0].commentId);
      expect(result.comment_content).toEqual(expectedResult[0].commentContent);
      expect(result.comment_date).toEqual(expectedResult[0].commentDate);
      expect(result.comment_owner_username).toEqual(expectedResult[0].commentOwnerUsername);
      expect(result.comment_is_deleted).toEqual(expectedResult[0].commentIsDeleted);
      expect(result.reply_id).toEqual(expectedResult[0].replyId);
      expect(result.reply_content).toEqual(expectedResult[0].replyContent);
      expect(result.reply_date).toEqual(expectedResult[0].replyDate);
      expect(result.reply_comment_id).toEqual(expectedResult[0].replyComment_id);
      expect(result.reply_is_deleted).toEqual(expectedResult[0].replyIsDeleted);
      expect(result.reply_owner_username).toEqual(expectedResult[0].replyOwnerUsername);

      const result2 = results[1];
      expect(result2.thread_id).toEqual(expectedResult[1].threadId);
      expect(result2.title).toEqual(expectedResult[1].title);
      expect(result2.body).toEqual(expectedResult[1].body);
      expect(result2.thread_owner_username).toEqual(expectedResult[1].threadOwnerUsername);
      expect(result2.comment_id).toEqual(expectedResult[1].commentId);
      expect(result2.comment_content).toEqual(expectedResult[1].commentContent);
      expect(result2.comment_date).toEqual(expectedResult[1].commentDate);
      expect(result2.comment_owner_username).toEqual(expectedResult[1].commentOwnerUsername);
      expect(result2.comment_is_deleted).toEqual(expectedResult[1].commentIsDeleted);
      expect(result2.reply_id).toEqual(expectedResult[1].replyId);
      expect(result2.reply_content).toEqual(expectedResult[1].replyContent);
      expect(result2.reply_date).toEqual(expectedResult[1].replyDate);
      expect(result2.reply_comment_id).toEqual(expectedResult[1].replyComment_id);
      expect(result2.reply_is_deleted).toEqual(expectedResult[1].replyIsDeleted);
      expect(result2.reply_owner_username).toEqual(expectedResult[1].replyOwnerUsername);

      const result3 = results[2];
      expect(result3.thread_id).toEqual(expectedResult[2].threadId);
      expect(result3.title).toEqual(expectedResult[2].title);
      expect(result3.body).toEqual(expectedResult[2].body);
      expect(result3.thread_owner_username).toEqual(expectedResult[2].threadOwnerUsername);
      expect(result3.comment_id).toEqual(expectedResult[2].commentId);
      expect(result3.comment_content).toEqual(expectedResult[2].commentContent);
      expect(result3.comment_date).toEqual(expectedResult[2].commentDate);
      expect(result3.comment_owner_username).toEqual(expectedResult[2].commentOwnerUsername);
      expect(result3.comment_is_deleted).toEqual(expectedResult[2].commentIsDeleted);
      expect(result3.reply_id).toBeNull();
      expect(result3.reply_content).toBeNull();
      expect(result3.reply_date).toBeNull();
      expect(result3.reply_comment_id).toBeNull();
      expect(result3.reply_is_deleted).toBeNull();
      expect(result3.reply_owner_username).toBeNull();

    });

    it('should return thread rows with commens and replies is deleted', async () => {
      const getThreadPayload = {
        threadId: 'thread-123',
      };

      const expectedResult = [{
        threadId: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        threadDate: '2024-06-17T01:01:00.00.000Z',
        threadOwnerUsername: 'user111',
        commentId: 'comment-1',
        commentContent: 'Sample Comment 1',
        commentDate: '2024-06-17T11:11:00.00.000Z',
        commentOwnerUsername: 'user222',
        commentIsDeleted: false,
        replyId: 'reply-2',
        replyContent: 'Sample Reply 2',
        replyDate: '2024-06-17T23:23:00.00.000Z',
        replyComment_id: 'comment-1',
        replyIsDeleted: false,
        replyOwnerUsername: 'user222',
      },
      {
        threadId: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        threadDate: '2024-06-17T01:01:00.00.000Z',
        threadOwnerUsername: 'user111',
        commentId: 'comment-1',
        commentContent: 'Sample Comment 1',
        commentDate: '2024-06-17T11:11:00.00.000Z',
        commentOwnerUsername: 'user222',
        commentIsDeleted: false,
        replyId: 'reply-1',
        replyContent: 'Sample Reply 1',
        replyDate: '2024-06-17T22:22:00.00.000Z',
        replyComment_id: 'comment-1',
        replyIsDeleted: true,
        replyOwnerUsername: 'user111',
      },
      {
        threadId: 'thread-123',
        title: 'Sample Thread',
        body: 'Sample Body',
        threadDate: '2024-06-17T01:01:00.00.000Z',
        threadOwnerUsername: 'user111',
        commentId: 'comment-2',
        commentContent: 'Sample Comment 2',
        commentDate: '2024-06-10T10:10:00.00.000Z',
        commentOwnerUsername: 'user333',
        commentIsDeleted: false,
        replyId: null,
        replyContent: null,
        replyDate: null,
        replyComment_id: null,
        replyIsDeleted: null,
        replyOwnerUsername: null,
      }];

      await UsersTableTestHelper.addUser({ id: 'user-111', username: 'user111' });
      await UsersTableTestHelper.addUser({ id: 'user-222', username: 'user222' });
      await UsersTableTestHelper.addUser({ id: 'user-333', username: 'user333' });

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Sample Thread', body: 'Sample Body', owner: 'user-111', date: '2024-06-17T01:01:00.00.000Z' });

      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-123', content: 'Sample Comment 1', owner: 'user-222', isDeleted: false, date: '2024-06-17T11:11:00.00.000Z' });
      await CommentsTableTestHelper.addComment({ id: 'comment-2', threadId: 'thread-123', content: 'Sample Comment 2', owner: 'user-333', isDeleted: false, date: '2024-06-10T10:10:00.00.000Z' });

      await RepliesTableTestHelper.addReply({ id: 'reply-1', commentId: 'comment-1', content: 'Sample Reply 1', owner: 'user-111', isDeleted: true, date: '2024-06-17T22:22:00.00.000Z' });
      await RepliesTableTestHelper.addReply({ id: 'reply-2', commentId: 'comment-1', content: 'Sample Reply 2', owner: 'user-222', isDeleted: false, date: '2024-06-17T23:23:00.00.000Z' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      const results = await threadRepositoryPostgres.getThread(getThreadPayload.threadId);

      expect(results.length).toEqual(3);

      const result = results[0];
      expect(result.thread_id).toEqual(expectedResult[0].threadId);
      expect(result.title).toEqual(expectedResult[0].title);
      expect(result.body).toEqual(expectedResult[0].body);
      expect(result.thread_owner_username).toEqual(expectedResult[0].threadOwnerUsername);
      expect(result.comment_id).toEqual(expectedResult[0].commentId);
      expect(result.comment_content).toEqual(expectedResult[0].commentContent);
      expect(result.comment_date).toEqual(expectedResult[0].commentDate);
      expect(result.comment_owner_username).toEqual(expectedResult[0].commentOwnerUsername);
      expect(result.comment_is_deleted).toEqual(expectedResult[0].commentIsDeleted);
      expect(result.reply_id).toEqual(expectedResult[0].replyId);
      expect(result.reply_content).toEqual(expectedResult[0].replyContent);
      expect(result.reply_date).toEqual(expectedResult[0].replyDate);
      expect(result.reply_comment_id).toEqual(expectedResult[0].replyComment_id);
      expect(result.reply_is_deleted).toEqual(expectedResult[0].replyIsDeleted);
      expect(result.reply_owner_username).toEqual(expectedResult[0].replyOwnerUsername);

      const result2 = results[1];
      expect(result2.thread_id).toEqual(expectedResult[1].threadId);
      expect(result2.title).toEqual(expectedResult[1].title);
      expect(result2.body).toEqual(expectedResult[1].body);
      expect(result2.thread_owner_username).toEqual(expectedResult[1].threadOwnerUsername);
      expect(result2.comment_id).toEqual(expectedResult[1].commentId);
      expect(result2.comment_content).toEqual(expectedResult[1].commentContent);
      expect(result2.comment_date).toEqual(expectedResult[1].commentDate);
      expect(result2.comment_owner_username).toEqual(expectedResult[1].commentOwnerUsername);
      expect(result2.comment_is_deleted).toEqual(expectedResult[1].commentIsDeleted);
      expect(result2.reply_id).toEqual(expectedResult[1].replyId);
      expect(result2.reply_content).toEqual(expectedResult[1].replyContent);
      expect(result2.reply_date).toEqual(expectedResult[1].replyDate);
      expect(result2.reply_comment_id).toEqual(expectedResult[1].replyComment_id);
      expect(result2.reply_is_deleted).toEqual(expectedResult[1].replyIsDeleted);
      expect(result2.reply_owner_username).toEqual(expectedResult[1].replyOwnerUsername);

      const result3 = results[2];
      expect(result3.thread_id).toEqual(expectedResult[2].threadId);
      expect(result3.title).toEqual(expectedResult[2].title);
      expect(result3.body).toEqual(expectedResult[2].body);
      expect(result3.thread_owner_username).toEqual(expectedResult[2].threadOwnerUsername);
      expect(result3.comment_id).toEqual(expectedResult[2].commentId);
      expect(result3.comment_content).toEqual(expectedResult[2].commentContent);
      expect(result3.comment_date).toEqual(expectedResult[2].commentDate);
      expect(result3.comment_owner_username).toEqual(expectedResult[2].commentOwnerUsername);
      expect(result3.comment_is_deleted).toEqual(expectedResult[2].commentIsDeleted);
      expect(result3.reply_id).toBeNull();
      expect(result3.reply_content).toBeNull();
      expect(result3.reply_date).toBeNull();
      expect(result3.reply_comment_id).toBeNull();
      expect(result3.reply_is_deleted).toBeNull();
      expect(result3.reply_owner_username).toBeNull();

    });
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
        .toThrow(NotFoundError);
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
        .resolves.not.toThrow(NotFoundError);
    });
  });

});