const subscriptionService = require('../services/subscriptionService');
const subscriptionRepository = require('../repositories/subscriptionRepository');

class SubscriptionController {
  async getSubscriptionStatus(req, res, next) {
    try {
      const { post_id } = req.params;
      const isSubscribed = await subscriptionRepository.isSubscribed(req.session.user.id, post_id);
      res.status(200).json({ status: 'success', isSubscribed });
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptions(req, res, next) {
    try {
      const { limit = 20, page = 1 } = req.query;
      const userId = req.session.user.id;
      const parsedLimit = parseInt(limit, 10);
      const parsedPage = parseInt(page, 10);
      const offset = (parsedPage - 1) * parsedLimit;

      const countResult = await subscriptionRepository.countByUserId(userId);
      const count = countResult[0]?.count || 0;

      if (count === 0) {
        return res.status(200).json({
          status: 'success',
          data: [],
          subscriptions: [],
          pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total: 0,
            pages: 0,
          },
        });
      }

      const result = await subscriptionRepository.findByUserIdWithCount(userId, parsedLimit, offset);
      const rows = Array.isArray(result[0]) ? result[0] : result;

      res.status(200).json({
        status: 'success',
        data: rows,
        subscriptions: rows,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total: count,
          pages: Math.ceil(count / parsedLimit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

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