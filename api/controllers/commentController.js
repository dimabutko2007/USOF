const commentService = require('../services/commentService');

class CommentController {
  async getCommentsByPostId(req, res, next) {
    try {
      const { post_id } = req.params;
      const { status, sort } = req.query;
      const comments = await commentService.getCommentsByPostId(post_id, { status, sort });
      res.status(200).json({ status: 'success', comments });
    } catch (error) {
      next(error);
    }
  }

  async getCommentById(req, res, next) {
    try {
      const { comment_id } = req.params;
      const comment = await commentService.getCommentById(comment_id);
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

  async updateCommentStatus(req, res, next) {
    try {
      const { comment_id } = req.params;
      const { status } = req.body;
      const updatedComment = await commentService.updateCommentStatus(comment_id, status, req.session.user);
      res.status(200).json({ status: 'success', comment: updatedComment });
    } catch (error) {
      next(error);
    }
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
