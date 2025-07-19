const routes = (handler) => [
  {
    method: "PUT",
    path: "/threads/{threadId}/comments/{commentId}/likes",
    handler: (request, h) => handler.putCommentLikeHandler(request, h),
    options: { 
      auth: "forumapi_jwt" 
    },
  },
];

module.exports = routes;
