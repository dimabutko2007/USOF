const postRepository = require('../repositories/postRepository');
const notificationService = require('./notificationService');
const { ApiError } = require('../middlewares/errorMiddleware');

class PostService {
  async getAllPosts(queryParams, currentUser) {
    const { page = 1, limit = 10, sort = 'likes', categories, startDate, endDate, status, search, author_id } = queryParams;
    return await postRepository.findAll(
      { page: parseInt(page, 10), limit: parseInt(limit, 10), sort, categories, startDate, endDate, status, search, author_id },
      currentUser
    );
  }

  async getPostById(postId, currentUser) {
    const post = await postRepository.findById(postId, currentUser);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

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

  async createPost({ title, content, categories, status }, currentUser, files = []) {
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
      images,
      status: status === 'inactive' ? 'inactive' : 'active'
    });

    return await postRepository.findById(postId);
  }

  async updatePost(postId, { title, content, categories, status, existingImages }, currentUser, files = []) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    if (post.status === 'inactive') {
      throw ApiError.forbidden('Inactive/locked posts cannot be edited.');
    }
    if (post.author_id !== currentUser.id && currentUser.role !== 'admin') {
      throw ApiError.forbidden('Only the author of the post or an administrator can edit it.');
    }

    let parsedCategories = undefined;
    if (categories !== undefined) {
      if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch (e) {
          parsedCategories = categories.split(',').map(c => parseInt(c.trim(), 10)).filter(n => !isNaN(n));
        }
      }
      if (!Array.isArray(parsedCategories) || parsedCategories.length === 0) {
        throw ApiError.badRequest('At least one category is required for the question.');
      }
    }

    let parsedExistingImages = undefined;
    if (existingImages !== undefined) {
      if (Array.isArray(existingImages)) {
        parsedExistingImages = existingImages;
      } else if (typeof existingImages === 'string') {
        try {
          parsedExistingImages = JSON.parse(existingImages);
        } catch (e) {
          parsedExistingImages = [existingImages];
        }
      }
    }

    const newImages = files && Array.isArray(files) ? files.map(f => `/uploads/posts/${f.filename}`) : [];

    await postRepository.update(postId, {
      title,
      content,
      categories: parsedCategories,
      existingImages: parsedExistingImages,
      newImages
    });

    if (status && (currentUser.role === 'admin' || currentUser.id === post.author_id)) {
      if (['active', 'inactive'].includes(status)) {
        await postRepository.updateStatus(postId, status);
        await notificationService.notifyPostSubscribers(postId, `Status of post #${postId} changed to ${status}`, currentUser.id);
      }
    }

    return await postRepository.findById(postId);
  }

  async updatePostStatus(postId, status, currentUser) {
    if (!['active', 'inactive'].includes(status)) {
      throw ApiError.badRequest("Invalid status. Must be 'active' or 'inactive'.");
    }

    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== post.author_id) {
      throw ApiError.forbidden('You are not authorized to change this post status.');
    }

    await postRepository.updateStatus(postId, status);
    await notificationService.notifyPostSubscribers(postId, `Status of post #${postId} changed to ${status}`, currentUser.id);
    return await postRepository.findById(postId, currentUser);
  }

  async deletePost(postId, currentUser) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== post.author_id) {
      throw ApiError.forbidden('You are not authorized to delete this post.');
    }

    await postRepository.delete(postId);
    return { message: 'Post deleted successfully.' };
  }
}

module.exports = new PostService();
