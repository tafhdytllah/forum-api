const AddCommentLikeUseCase = require('../../../../Applications/use_case/AddCommentLikeUseCase');

class CommentLikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putCommentLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const addCommentLikeUseCase = this._container.getInstance(AddCommentLikeUseCase.name);

    await addCommentLikeUseCase.execute({ userId, threadId, commentId });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }

}

module.exports = CommentLikesHandler;
