const postService = require('../services/postService');

class PostController {
  async getAllPosts(req, res, next) {
    try {
      const currentUser = req.session ? req.session.user : null;
      const posts = await postService.getAllPosts(req.query, currentUser);
      res.status(200).json({ status: 'success', posts });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req, res, next) {
    try {
      const { post_id } = req.params;
      const currentUser = req.session ? req.session.user : null;
      const post = await postService.getPostById(post_id, currentUser);
      res.status(200).json({ status: 'success', post });
    } catch (error) {
      next(error);
    }
  }

  async getPostCategories(req, res, next) {
    try {
      const { post_id } = req.params;
      const currentUser = req.session ? req.session.user : null;
      const categories = await postService.getPostCategories(post_id, currentUser);
      res.status(200).json({ status: 'success', categories });
    } catch (error) {
      next(error);
    }
  }

  async createPost(req, res, next) {
    try {
      const { title, content, categories } = req.body;
      const files = req.files || [];
      const newPost = await postService.createPost({ title, content, categories }, req.session.user, files);
      res.status(201).json({ status: 'success', post: newPost });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req, res, next) {
    try {
      const { post_id } = req.params;
      const { title, content, categories, status } = req.body;
      const updatedPost = await postService.updatePost(
        post_id,
        { title, content, categories, status },
        req.session.user
      );
      res.status(200).json({ status: 'success', post: updatedPost });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { post_id } = req.params;
      const { status } = req.body;
      const updatedPost = await postService.updatePostStatus(post_id, status, req.session.user);
      res.status(200).json({ status: 'success', post: updatedPost });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      const { post_id } = req.params;
      const result = await postService.deletePost(post_id, req.session.user);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();
