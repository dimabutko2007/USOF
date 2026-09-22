const commentRepository = require('../repositories/commentRepository');
const postRepository = require('../repositories/postRepository');
const notificationService = require('./notificationService');
const { ApiError } = require('../middlewares/errorMiddleware');

class CommentService {
  async getCommentsByPostId(postId, currentUser) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }
    return await commentRepository.findCommentsByPostId(postId, currentUser);
  }

  async getCommentById(commentId, currentUser) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }

    if (comment.status === 'inactive') {
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== comment.author_id)) {
        throw ApiError.notFound('Comment not found or unavailable.');
      }
    }

    return comment;
  }

  async createComment({ postId, content }, currentUser) {
    if (!content || !content.trim()) {
      throw ApiError.badRequest('Comment content cannot be empty.');
    }

    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    if (post.status === 'inactive') {
      throw ApiError.forbidden('Cannot comment on inactive/locked posts.');
    }

    const commentId = await commentRepository.create({
      author_id: currentUser.id,
      post_id: postId,
      content: content.trim()
    });

    const newComment = await commentRepository.findById(commentId);
    
    await notificationService.notifyPostSubscribers(
      postId,
      `New comment on post "${post.title}": ${content.trim().substring(0, 50)}...`,
      currentUser.id
    );

    return newComment;
  }

  async updateCommentStatus(commentId, status, currentUser) {
    if (!['active', 'inactive'].includes(status)) {
      throw ApiError.badRequest("Invalid status. Must be 'active' or 'inactive'.");
    }

    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== comment.author_id) {
      throw ApiError.forbidden('You are not authorized to change this comment status.');
    }

    await commentRepository.updateStatus(commentId, status);
    return await commentRepository.findById(commentId);
  }

  async deleteComment(commentId, currentUser) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== comment.author_id) {
      throw ApiError.forbidden('You are not authorized to delete this comment.');
    }

    await commentRepository.delete(commentId);
    return { message: 'Comment deleted successfully.' };
  }
}

module.exports = new CommentService();
