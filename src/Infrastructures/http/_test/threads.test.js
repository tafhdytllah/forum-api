const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted threads', async () => {
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

      const responseJson = JSON.parse(addedThreadResponse.payload);

      expect(addedThreadResponse.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(addThreadPayload.title);
      expect(responseJson.data.addedThread.owner).toEqual(userId);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const server = await createServer(container);

      // Register and login first
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Test User',
        },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson?.data?.accessToken;

      // Missing 'title' property
      const invalidPayload = {
        body: 'isi body doang',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: invalidPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container);

      // Register user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login to get access token
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson?.data?.accessToken;

      // Payload salah: body harus string, tapi dikirim array
      const invalidPayload = {
        title: 'judul thread',
        body: ['isi body tidak valid'],
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: invalidPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should respond 200 and return thread detail', async () => {
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

      const addReplyPayload = {
        content: 'ini reply',
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

      const addedCommentResponseJson = JSON.parse(addedCommentResponse.payload);
      const commentId = addedCommentResponseJson.data.addedComment.id;

      await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${commentId}/replies`,
        payload: addReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Act
      const getThreadResponse = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(getThreadResponse.payload);
      expect(getThreadResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const thread = responseJson.data.thread;
      expect(thread).toBeDefined();
      expect(thread.id).toEqual(addedThread.id);
      expect(thread.title).toEqual(addThreadPayload.title);
      expect(thread.body).toEqual(addThreadPayload.body);
      expect(thread.username).toEqual(addUserPayload.username);

      expect(Array.isArray(thread.comments)).toBe(true);
      expect(thread.comments).toHaveLength(1);

      const comment = thread.comments[0];
      expect(comment.content).toEqual(addCommentPayload.content);
      expect(comment.username).toEqual(addUserPayload.username);

      expect(Array.isArray(comment.replies)).toBe(true);
      expect(comment.replies).toHaveLength(1);

      const reply = comment.replies[0];
      expect(reply.content).toEqual(addReplyPayload.content);
      expect(reply.username).toEqual(addUserPayload.username);

    });


    it('should respond 404 when thread not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/non-existent-thread',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

});