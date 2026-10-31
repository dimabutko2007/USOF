const favoriteRepository = require('../repositories/favoriteRepository');
const postRepository = require('../repositories/postRepository');
const { ApiError } = require('../middlewares/errorMiddleware');

class FavoriteService {
  async addFavorite(postId, currentUser) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    if (post.status === 'inactive') {
      throw ApiError.forbidden('Cannot bookmark inactive posts.');
    }

    await favoriteRepository.add(currentUser.id, postId);
    return { message: 'Post added to favorites successfully.' };
  }

  async removeFavorite(postId, currentUser) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    await favoriteRepository.remove(currentUser.id, postId);
    return { message: 'Post removed from favorites.' };
  }

  async getUserFavorites(currentUser) {
    return await favoriteRepository.getUserFavorites(currentUser.id);
  }
}

module.exports = new FavoriteService();
