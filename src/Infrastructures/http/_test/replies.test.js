const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted replies', async () => {
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
      const addedComment = addedCommentResponseJson?.data?.addedComment;

      const addedReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: addReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addedReplyResponse.payload);

      expect(addedReplyResponse.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(addReplyPayload.content);
      expect(responseJson.data.addedReply.owner).toEqual(userId);
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
        content: 'ini comment',
      };

      const addReplyPayload = {
        // content: 'ini reply',
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

      const addedCommentResponseJson = JSON.parse(addedCommentResponse.payload);
      const addedComment = addedCommentResponseJson?.data?.addedComment;

      const addedReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: addReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addedReplyResponse.payload);

      expect(addedReplyResponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
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
        content: 'ini comment',
      };

      const addReplyPayload = {
        content: 123, // should be string
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

      const addedCommentResponseJson = JSON.parse(addedCommentResponse.payload);
      const addedComment = addedCommentResponseJson?.data?.addedComment;

      const addedReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: addReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addedReplyResponse.payload);

      expect(addedReplyResponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and delete reply', async () => {
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

      // Add reply
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'a reply',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const replyId = JSON.parse(replyResponse.payload).data.addedReply.id;

      // Delete reply
      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(deleteResponse.payload);

      expect(deleteResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const replies = await RepliesTableTestHelper.findReplyById(replyId);
      expect(replies[0].is_deleted).toBe(true);
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
        url: '/threads/thread-tidak-ada/comments/comment-123/replies/reply-123',
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
        url: `/threads/${threadId}/comments/comment-tidak-ada/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 404 if reply not found', async () => {
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

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-tidak-ada`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });

    it('should response 403 if user is not reply owner', async () => {
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

      const threadResponse = await server.inject({
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

      const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment',
        },
        headers: {
          Authorization: `Bearer ${tokenA}`,
        },
      });

      const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'a reply',
        },
        headers: {
          Authorization: `Bearer ${tokenA}`,
        },
      });

      const replyId = JSON.parse(replyResponse.payload).data.addedReply.id;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${tokenB}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak mengakses reply ini');
    });
  })
});