const notificationRepository = require('../repositories/notificationRepository');
const subscriptionRepository = require('../repositories/subscriptionRepository');
const { ApiError } = require('../middlewares/errorMiddleware');

class NotificationService {
  /**
   * Fetch all notifications for a specific user
   */
  async getUserNotifications(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Notification not found.');
    }

    if (notification.user_id !== userId) {
      throw ApiError.forbidden('Access denied to this notification.');
    }

    await notificationRepository.markAsRead(notificationId, userId);
    return { message: 'Notification marked as read.' };
  }

  /**
   * Trigger notifications to all subscribers of a post (excluding actor)
   */
  async notifyPostSubscribers(postId, message, excludeUserId = null) {
    const subscribers = await subscriptionRepository.findSubscribersByPostId(postId);
    const targetUserIds = subscribers.filter(userId => userId !== excludeUserId);

    if (targetUserIds.length > 0) {
      await notificationRepository.createBulk(targetUserIds, message);
    }
  }
}

module.exports = new NotificationService();
