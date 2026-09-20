const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

const postFavoriteRouter = express.Router({ mergeParams: true });
postFavoriteRouter.post('/', isAuthenticated, favoriteController.addFavorite);
postFavoriteRouter.delete('/', isAuthenticated, favoriteController.removeFavorite);

const userFavoritesRouter = express.Router();
userFavoritesRouter.get('/', isAuthenticated, favoriteController.getUserFavorites);

module.exports = {
  postFavoriteRouter,
  userFavoritesRouter
};
