const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const LuxonDateTimeFormatter = require('../../date_time/LuxonDateTimeFormatter');
const { DateTime } = require('luxon');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
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