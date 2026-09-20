const notificationService = require('../services/notificationService');

class NotificationController {
  async getUserNotifications(req, res, next) {
    try {
      const notifications = await notificationService.getUserNotifications(req.session.user.id);
      res.status(200).json({ status: 'success', notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { notification_id } = req.params;
      const result = await notificationService.markAsRead(notification_id, req.session.user.id);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
