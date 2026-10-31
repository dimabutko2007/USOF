import api from './client';

export const commentsApi = {
  getCommentsByPost: (postId, params = {}) =>
    api.get(`/posts/${postId}/comments`, { params }),
  getCommentById: (commentId) => api.get(`/comments/${commentId}`),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  updateCommentStatus: (commentId, status) =>
    api.patch(`/comments/${commentId}`, { status }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

