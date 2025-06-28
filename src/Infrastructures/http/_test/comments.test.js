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

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment', async () => {
      const server = await createServer(container);

      // Register + login user
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

      const { accessToken } = JSON.parse(loginResponse.payload).data;
      const userId = (await UsersTableTestHelper.findUserByUsername('dicoding'))[0].id;

      // Add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title',
          body: 'body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      // Add comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

      // Delete comment
      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(deleteResponse.payload);

      expect(deleteResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments[0].is_deleted).toBe(true);
    });

    it('should response 404 if thread not found', async () => {
      const server = await createServer(container);

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

      const { accessToken } = JSON.parse(loginResponse.payload).data;

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-tidak-ada/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 if comment not found', async () => {
      const server = await createServer(container);

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

      const { accessToken } = JSON.parse(loginResponse.payload).data;

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'judul',
          body: 'isi',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-tidak-ada`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 403 if user is not comment owner', async () => {
      const server = await createServer(container);

      // User A
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'userA',
          password: 'secret',
          fullname: 'User A',
        },
      });

      const loginA = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'userA',
          password: 'secret',
        },
      });

      const tokenA = JSON.parse(loginA.payload).data.accessToken;

      // User B
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'userB',
          password: 'secret',
          fullname: 'User B',
        },
      });

      const loginB = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'userB',
          password: 'secret',
        },
      });

      const tokenB = JSON.parse(loginB.payload).data.accessToken;

      // A buat thread
      const threadRes = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'judul',
          body: 'isi',
        },
        headers: {
          Authorization: `Bearer ${tokenA}`,
        },
      });

      const threadId = JSON.parse(threadRes.payload).data.addedThread.id;

      // A buat comment
      const commentRes = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'komentar dari A',
        },
        headers: {
          Authorization: `Bearer ${tokenA}`,
        },
      });

      const commentId = JSON.parse(commentRes.payload).data.addedComment.id;

      // B coba hapus
      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${tokenB}`,
        },
      });

      const responseJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak mengakses comment ini');
    });
  })
});