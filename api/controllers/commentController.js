const commentService = require('../services/commentService');

class CommentController {
  async getCommentsByPostId(req, res, next) {
    try {
      const { post_id } = req.params;
      const { status, sort } = req.query;
      const currentUser = req.session ? req.session.user : null;
      const comments = await commentService.getCommentsByPostId(post_id, { status, sort }, currentUser);
      res.status(200).json({ status: 'success', comments });
    } catch (error) {
      next(error);
    }
  }

  async getCommentById(req, res, next) {
    try {
      const { comment_id } = req.params;
      const currentUser = req.session ? req.session.user : null;
      const comment = await commentService.getCommentById(comment_id, currentUser);
      res.status(200).json({ status: 'success', comment });
    } catch (error) {
      next(error);
    }
  }

  async createComment(req, res, next) {
    try {
      const { post_id } = req.params;
      const { content, parent_id } = req.body;
      const newComment = await commentService.createComment({ postId: post_id, content, parentId: parent_id }, req.session.user);
      res.status(201).json({ status: 'success', comment: newComment });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const { status, content } = req.body;
      const currentUser = req.session ? req.session.user : null;
      const updatedComment = await commentService.updateComment(comment_id, { status, content }, currentUser);
      res.status(200).json({ status: 'success', comment: updatedComment });
    } catch (error) {
      next(error);
    }
  }

  async updateCommentStatus(req, res, next) {
    return this.updateComment(req, res, next);
  }

  async deleteComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const result = await commentService.deleteComment(comment_id, req.session.user);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
