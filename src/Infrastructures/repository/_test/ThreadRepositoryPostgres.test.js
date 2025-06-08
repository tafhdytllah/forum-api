const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const LuxonDateTimeFormatter = require('../../date_time/LuxonDateTimeFormatter');
const { DateTime } = require('luxon');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

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

      await UsersTableTestHelper.addUser({ id: 'user-123' });

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

  });
});