import api from './client';

export const likesApi = {
  getPostLikes: (postId) => api.get(`/posts/${postId}/like`),
  addPostLike: (postId, type) => api.post(`/posts/${postId}/like`, { type }),
  removePostLike: (postId) => api.delete(`/posts/${postId}/like`),
  getCommentLikes: (commentId) => api.get(`/comments/${commentId}/like`),
  addCommentLike: (commentId, type) => api.post(`/comments/${commentId}/like`, { type }),
  removeCommentLike: (commentId) => api.delete(`/comments/${commentId}/like`),
};

export const favoritesApi = {
  getFavorites: () => api.get('/favorites'),
  addFavorite: (postId) => api.post(`/posts/${postId}/favorite`),
  removeFavorite: (postId) => api.delete(`/posts/${postId}/favorite`),
};

export const categoriesApi = {
  getCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  getCategoryPosts: (id) => api.get(`/categories/${id}/posts`),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const userApi = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  uploadAvatar: (formData, userId = null) => {
    const url = userId ? `/users/${userId}/avatar` : '/users/avatar';
    return api.patch(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const notificationsApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

