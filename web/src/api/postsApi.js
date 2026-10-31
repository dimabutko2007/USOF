import api from './client';

export const postsApi = {
  getPosts: (params = {}) => api.get('/posts', { params }),
  getPostById: (id) => api.get(`/posts/${id}`),
  getPostCategories: (id) => api.get(`/posts/${id}/categories`),
  createPost: (formData) =>
    api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updatePost: (id, data) => {
    if (data instanceof FormData) {
      return api.patch(`/posts/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.patch(`/posts/${id}`, data);
  },
  updatePostStatus: (id, status) => api.patch(`/posts/${id}/status`, { status }),
  deletePost: (id) => api.delete(`/posts/${id}`),
  subscribe: (id) => api.post(`/posts/${id}/subscribe`),
  unsubscribe: (id) => api.delete(`/posts/${id}/subscribe`),
  getPostSubscription: (id) => api.get(`/posts/${id}/subscription`),
};

