const postRepository = require('../repositories/postRepository');
const notificationService = require('./notificationService');
const { ApiError } = require('../middlewares/errorMiddleware');

class PostService {
  async getAllPosts(queryParams, currentUser) {
    const { page = 1, limit = 10, sort = 'likes', categories, startDate, endDate, status } = queryParams;
    return await postRepository.findAll(
      { page: parseInt(page, 10), limit: parseInt(limit, 10), sort, categories, startDate, endDate, status },
      currentUser
    );
  }

  async getPostById(postId, currentUser) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    // Visibility rules: inactive posts hidden from non-authors and non-admins
    if (post.status === 'inactive') {
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== post.author_id)) {
        throw ApiError.notFound('Post not found or unavailable.');
      }
    }

    return post;
  }

  async getPostCategories(postId, currentUser) {
    const post = await this.getPostById(postId, currentUser);
    return post.categories || [];
  }

  async createPost({ title, content, categories }, currentUser, files = []) {
    if (!title || !content) {
      throw ApiError.badRequest('Title and content are required.');
    }

    let parsedCategories = [];
    if (categories) {
      if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch (e) {
          parsedCategories = categories.split(',').map(c => parseInt(c.trim(), 10)).filter(n => !isNaN(n));
        }
      }
    }

    const images = files && Array.isArray(files) ? files.map(f => `/uploads/posts/${f.filename}`) : [];

    const postId = await postRepository.create({
      author_id: currentUser.id,
      title,
      content,
      categories: parsedCategories,
      images
    });

    return await postRepository.findById(postId);
  }

  async updatePost(postId, { title, content, categories, status }, currentUser) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    // Status inactive lock check: content cannot be edited when post is inactive
    if (post.status === 'inactive') {
      throw ApiError.forbidden('Inactive/locked posts cannot be edited.');
    }

    // Only author can update title/content/categories
    if (post.author_id !== currentUser.id) {
      throw ApiError.forbidden('Only the author of the post can edit it.');
    }

    await postRepository.update(postId, { title, content, categories });

    // Status change by admin if provided
    if (status && currentUser.role === 'admin') {
      await postRepository.updateStatus(postId, status);
      await notificationService.notifyPostSubscribers(postId, `Status of post #${postId} changed to ${status}`, currentUser.id);
    }

    return await postRepository.findById(postId);
  }

  async updatePostStatus(postId, status, currentUser) {
    if (currentUser.role !== 'admin') {
      throw ApiError.forbidden('Only administrators can change post active/inactive status.');
    }

    if (!['active', 'inactive'].includes(status)) {
      throw ApiError.badRequest("Invalid status. Must be 'active' or 'inactive'.");
    }

    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    await postRepository.updateStatus(postId, status);
    await notificationService.notifyPostSubscribers(postId, `Status of post #${postId} changed to ${status}`, currentUser.id);
    return await postRepository.findById(postId);
  }

  async deletePost(postId, currentUser) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    // Author or Admin can delete post
    if (currentUser.role !== 'admin' && currentUser.id !== post.author_id) {
      throw ApiError.forbidden('You are not authorized to delete this post.');
    }

    await postRepository.delete(postId);
    return { message: 'Post deleted successfully.' };
  }
}

module.exports = new PostService();
