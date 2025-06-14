const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comments', async () => {
      const server = await createServer(container);

      const addUserPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Test User',
      }

      const loginPayload = {
        username: addUserPayload.username,
        password: addUserPayload.password,
      }

      const addThreadPayload = {
        title: 'ini title',
        body: 'ini body',
      };

      const addCommentPayload = {
        content: 'ini comment',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: addUserPayload,
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson?.data?.accessToken;
      const users = await UsersTableTestHelper.findUserByUsername(addUserPayload.username);
      const userId = users[0].id;

      const addedThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: addThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const addedThreadResponseJson = JSON.parse(addedThreadResponse.payload);
      const addedThread = addedThreadResponseJson?.data?.addedThread;

      const addedCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: addCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addedCommentResponse.payload);

      expect(addedCommentResponse.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(addCommentPayload.content);
      expect(responseJson.data.addedComment.owner).toEqual(userId);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const server = await createServer(container);

      const addUserPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Test User',
      }

      const loginPayload = {
        username: addUserPayload.username,
        password: addUserPayload.password,
      }

      const addThreadPayload = {
        title: 'ini title',
        body: 'ini body',
      };

      const addCommentPayload = {
        // content: 'ini comment', // tanpa property
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: addUserPayload,
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson?.data?.accessToken;

      const addedThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: addThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const addedThreadResponseJson = JSON.parse(addedThreadResponse.payload);
      const addedThread = addedThreadResponseJson?.data?.addedThread;

      const addedCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: addCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addedCommentResponse.payload);

      expect(addedCommentResponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const server = await createServer(container);

      const addUserPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Test User',
      }

      const loginPayload = {
        username: addUserPayload.username,
        password: addUserPayload.password,
      }

      const addThreadPayload = {
        title: 'ini title',
        body: 'ini body',
      };

      const addCommentPayload = {
        content: 12345, // tipe data salah
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: addUserPayload,
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson?.data?.accessToken;

      const addedThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: addThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const addedThreadResponseJson = JSON.parse(addedThreadResponse.payload);
      const addedThread = addedThreadResponseJson?.data?.addedThread;

      const addedCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: addCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addedCommentResponse.payload);

      expect(addedCommentResponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });
  });
});