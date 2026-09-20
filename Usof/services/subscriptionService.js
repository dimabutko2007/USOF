const subscriptionRepository = require('../repositories/subscriptionRepository');
const postRepository = require('../repositories/postRepository');
const { ApiError } = require('../middlewares/errorMiddleware');

class SubscriptionService {
  /**
   * Subscribe user to a post
   */
  async subscribeToPost(userId, postId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    const created = await subscriptionRepository.create(userId, postId);
    if (!created) {
      return { message: 'Already subscribed to this post.' };
    }
    return { message: 'Successfully subscribed to post updates.' };
  }

  /**
   * Unsubscribe user from a post
   */
  async unsubscribeFromPost(userId, postId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    const deleted = await subscriptionRepository.delete(userId, postId);
    if (!deleted) {
      return { message: 'Not subscribed to this post.' };
    }
    return { message: 'Successfully unsubscribed from post updates.' };
  }
}

module.exports = new SubscriptionService();
