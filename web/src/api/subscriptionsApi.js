import api from './client';

export const subscriptionsApi = {
  getSubscriptions: (params = {}) => api.get('/subscriptions', { params }),
  subscribe: (postId) => api.post(`/posts/${postId}/subscribe`),
  unsubscribe: (postId) => api.delete(`/posts/${postId}/subscribe`),
  getPostSubscription: (postId) => api.get(`/posts/${postId}/subscription`),
};