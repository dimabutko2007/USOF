const commentRepository = require('../repositories/commentRepository');
const postRepository = require('../repositories/postRepository');
const notificationService = require('./notificationService');
const { ApiError } = require('../middlewares/errorMiddleware');

class CommentService {
  async getCommentsByPostId(postId, filters = {}, currentUser = null) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }
    return await commentRepository.findCommentsByPostId(postId, filters, currentUser);
  }

  async getCommentById(commentId, currentUser = null) {
    const comment = await commentRepository.findById(commentId, currentUser);
    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }

    return comment;
  }

  async createComment({ postId, content, parentId = null }, currentUser) {
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

    if (parentId) {
      const parentComment = await commentRepository.findById(parentId);
      if (!parentComment || parentComment.post_id !== parseInt(postId, 10)) {
        throw ApiError.badRequest('Parent comment does not exist on this post.');
      }
    }

    const commentId = await commentRepository.create({
      author_id: currentUser.id,
      post_id: postId,
      parent_id: parentId || null,
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

  async updateComment(commentId, { status, content }, currentUser) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }

    if (content !== undefined) {
      if (!content || !content.trim()) {
        throw ApiError.badRequest('Comment content cannot be empty.');
      }
      // Rule: Admin cannot edit other users' comments - only the author can edit comment content
      if (currentUser.id !== comment.author_id) {
        throw ApiError.forbidden('Only the author can edit the comment content.');
      }
      await commentRepository.updateContent(commentId, content.trim());
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        throw ApiError.badRequest("Invalid status. Must be 'active' or 'inactive'.");
      }
      if (currentUser.role !== 'admin' && currentUser.id !== comment.author_id) {
        throw ApiError.forbidden('You are not authorized to change this comment status.');
      }
      await commentRepository.updateStatus(commentId, status);
    }

    return await commentRepository.findById(commentId, currentUser);
  }

  async updateCommentStatus(commentId, status, currentUser) {
    return await this.updateComment(commentId, { status }, currentUser);
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
