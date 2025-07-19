const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when Like without authentication', async () => {
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

      const addedCommentResponseJson = JSON.parse(addedCommentResponse.payload);
      const addedComment = addedCommentResponseJson?.data?.addedComment;

      const likeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        // headers: { // without authentication
        //   Authorization: `Bearer ${accessToken}`,
        // },
      });

      // verify response
      expect(likeResponse.statusCode).toEqual(401);
      const likeResponseJson = JSON.parse(likeResponse.payload);
      expect(likeResponseJson.error).toEqual('Unauthorized');
    });

    it('should response 404 when Like with invalid thread', async () => {
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

      const addedCommentResponseJson = JSON.parse(addedCommentResponse.payload);
      const addedComment = addedCommentResponseJson?.data?.addedComment;

      const likeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/xxx/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // verify response
      expect(likeResponse.statusCode).toEqual(404);
      const likeResponseJson = JSON.parse(likeResponse.payload);
      console.log(likeResponseJson);
      expect(likeResponseJson.status).toEqual('fail');
    });

    it('should response 404 when Like with invalid comment', async () => {
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

      const addedCommentResponseJson = JSON.parse(addedCommentResponse.payload);
      const addedComment = addedCommentResponseJson?.data?.addedComment;

      const likeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/xxx/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // verify response
      expect(likeResponse.statusCode).toEqual(404);
      const likeResponseJson = JSON.parse(likeResponse.payload);
      expect(likeResponseJson.status).toEqual('fail');
    });

    it('should response 200 and persisted comment like when add comment like', async () => {
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

      const addedCommentResponseJson = JSON.parse(addedCommentResponse.payload);
      const addedComment = addedCommentResponseJson?.data?.addedComment;

      const likeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // verify response
      expect(likeResponse.statusCode).toEqual(200);
      const likeResponseJson = JSON.parse(likeResponse.payload);
      expect(likeResponseJson.status).toEqual('success');

      // verify in database
      const likes = await CommentLikesTableTestHelper.findCommentLike(userId, addedComment.id);

      expect(likes).toHaveLength(1);
    });

    it('should response 200 and remove comment like when already liked (unlike)', async () => {
      const server = await createServer(container);

      const addUserPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Test User',
      };

      const loginPayload = {
        username: addUserPayload.username,
        password: addUserPayload.password,
      };

      const addThreadPayload = {
        title: 'ini title',
        body: 'ini body',
      };

      const addCommentPayload = {
        content: 'ini comment',
      };

      // Register
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: addUserPayload,
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);
      const accessToken = loginResponseJson?.data?.accessToken;
      const users = await UsersTableTestHelper.findUserByUsername(addUserPayload.username);
      const userId = users[0].id;

      // Add thread
      const addedThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: addThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const addedThread = JSON.parse(addedThreadResponse.payload).data.addedThread;

      // Add comment
      const addedCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: addCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const addedComment = JSON.parse(addedCommentResponse.payload).data.addedComment;

      // Like the comment (first time)
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Like the comment (second time — should toggle to unlike)
      const unlikeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // verify response
      expect(unlikeResponse.statusCode).toEqual(200);
      const unlikeResponseJson = JSON.parse(unlikeResponse.payload);
      expect(unlikeResponseJson.status).toEqual('success');

      // verify in database — should be soft-deleted (is_deleted = true)
      const likes = await CommentLikesTableTestHelper.findCommentLike(userId, addedComment.id);

      expect(likes).toHaveLength(0);
    });
  });


});