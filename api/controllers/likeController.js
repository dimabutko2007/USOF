const likeService = require('../services/likeService');

class LikeController {
  async getPostLikes(req, res, next) {
    try {
      const { post_id } = req.params;
      const likes = await likeService.getLikes('post', post_id);
      res.status(200).json({ status: 'success', likes });
    } catch (error) {
      next(error);
    }
  }

  async addPostLike(req, res, next) {
    try {
      const { post_id } = req.params;
      const { type = 'like' } = req.body;
      const result = await likeService.addOrUpdateLike('post', post_id, type, req.session.user);
      res.status(201).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async deletePostLike(req, res, next) {
    try {
      const { post_id } = req.params;
      const result = await likeService.deleteLike('post', post_id, req.session.user);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getCommentLikes(req, res, next) {
    try {
      const { comment_id } = req.params;
      const likes = await likeService.getLikes('comment', comment_id);
      res.status(200).json({ status: 'success', likes });
    } catch (error) {
      next(error);
    }
  }

  async addCommentLike(req, res, next) {
    try {
      const { comment_id } = req.params;
      const { type = 'like' } = req.body;
      const result = await likeService.addOrUpdateLike('comment', comment_id, type, req.session.user);
      res.status(201).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentLike(req, res, next) {
    try {
      const { comment_id } = req.params;
      const result = await likeService.deleteLike('comment', comment_id, req.session.user);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LikeController();
