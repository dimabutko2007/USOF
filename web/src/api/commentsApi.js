import api from './client';

export const commentsApi = {
  getCommentsByPost: (postId, params = {}) =>
    api.get(`/posts/${postId}/comments`, { params }),
  getCommentById: (commentId) => api.get(`/comments/${commentId}`),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  updateCommentStatus: (commentId, status) =>
    api.patch(`/comments/${commentId}`, { status }),
  updateComment: (commentId, data) =>
    api.patch(`/comments/${commentId}`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

