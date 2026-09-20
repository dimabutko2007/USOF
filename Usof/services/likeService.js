const likeRepository = require('../repositories/likeRepository');
const postRepository = require('../repositories/postRepository');
const commentRepository = require('../repositories/commentRepository');
const userRepository = require('../repositories/userRepository');
const { ApiError } = require('../middlewares/errorMiddleware');

class LikeService {
  /**
   * Helper to verify target existence and get target author ID
   */
  async _getTargetAuthorId(targetType, targetId) {
    if (targetType === 'post') {
      const post = await postRepository.findById(targetId);
      if (!post) throw ApiError.notFound('Post not found.');
      return post.author_id;
    } else if (targetType === 'comment') {
      const comment = await commentRepository.findById(targetId);
      if (!comment) throw ApiError.notFound('Comment not found.');
      return comment.author_id;
    } else {
      throw ApiError.badRequest('Invalid target type.');
    }
  }

  async getLikes(targetType, targetId) {
    await this._getTargetAuthorId(targetType, targetId);
    return await likeRepository.findByTarget(targetType, targetId);
  }

  async addOrUpdateLike(targetType, targetId, type, currentUser) {
    if (!['like', 'dislike'].includes(type)) {
      throw ApiError.badRequest("Reaction type must be 'like' or 'dislike'.");
    }

    const targetAuthorId = await this._getTargetAuthorId(targetType, targetId);

    await likeRepository.createOrUpdate({
      author_id: currentUser.id,
      target_type: targetType,
      target_id: targetId,
      type
    });

    // Automatically recalculate target author rating
    await userRepository.recalculateRating(targetAuthorId);

    return {
      message: `Reaction '${type}' added successfully.`,
      target_type: targetType,
      target_id: parseInt(targetId, 10),
      type
    };
  }

  async deleteLike(targetType, targetId, currentUser) {
    const targetAuthorId = await this._getTargetAuthorId(targetType, targetId);

    const existingLike = await likeRepository.findByUserAndTarget(currentUser.id, targetType, targetId);
    if (!existingLike) {
      throw ApiError.notFound('No like/dislike found to delete.');
    }

    await likeRepository.delete(currentUser.id, targetType, targetId);

    // Automatically recalculate target author rating
    await userRepository.recalculateRating(targetAuthorId);

    return { message: 'Reaction deleted successfully.' };
  }
}

module.exports = new LikeService();
