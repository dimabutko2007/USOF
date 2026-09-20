const subscriptionService = require('../services/subscriptionService');

class SubscriptionController {
  async subscribe(req, res, next) {
    try {
      const { post_id } = req.params;
      const result = await subscriptionService.subscribeToPost(req.session.user.id, post_id);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async unsubscribe(req, res, next) {
    try {
      const { post_id } = req.params;
      const result = await subscriptionService.unsubscribeFromPost(req.session.user.id, post_id);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
