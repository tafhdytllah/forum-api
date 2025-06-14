const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const LuxonDateTimeFormatter = require('../../date_time/LuxonDateTimeFormatter');
const { DateTime } = require('luxon');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('AddComment function', () => {
    it('should throw InvariantError if comment not added', async () => {
      const fakePool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }), // Simulasi gagal insert
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

      const fakeCommentPayload = {
        content: 'a comment',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      await expect(commentRepositoryPostgres.addComment(fakeCommentPayload))
        .rejects.toThrow(InvariantError);
    });

    it('should persist add thread and return add comment correctly', async () => {

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

      const addComment = new AddComment({
        content: 'ini comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const dateTimeFormatter = new LuxonDateTimeFormatter(DateTime);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator, dateTimeFormatter);

      await commentRepositoryPostgres.addComment(addComment);

      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');

      expect(comments).toHaveLength(1);
    });
  });

  // describe('verifyCommentOwner function', () => {
  //   it('should throw InvariantError if thread not available', async () => {

  //     await ThreadsTableTestHelper.addThread({
  //       id: 'thread-123',
  //       title: 'Sebuah thread',
  //       body: 'Isi dari thread',
  //       owner: 'user-123',
  //     });

  //     const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

  //     await expect(commentRepositoryPostgres.verifyCommentOwner('user-123', 'thread-123'))
  //       .rejects.toThrow(InvariantError);
  //   });
  // });
});