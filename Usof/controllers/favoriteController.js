const favoriteService = require('../services/favoriteService');

class FavoriteController {
  async addFavorite(req, res, next) {
    try {
      const { post_id } = req.params;
      const result = await favoriteService.addFavorite(post_id, req.session.user);
      res.status(201).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req, res, next) {
    try {
      const { post_id } = req.params;
      const result = await favoriteService.removeFavorite(post_id, req.session.user);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getUserFavorites(req, res, next) {
    try {
      const favorites = await favoriteService.getUserFavorites(req.session.user);
      res.status(200).json({ status: 'success', favorites });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteController();
