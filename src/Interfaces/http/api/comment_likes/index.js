const CommentLikeHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'comment_likes',
  register: async (server, { container }) => {
    const commentLikesHandler = new CommentLikeHandler(container);
    server.route(routes(commentLikesHandler));
  },
};
