import api from './client';

export const authApi = {
  getMe: () => api.get('/auth/me'),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  confirmEmail: (token) => api.get(`/auth/confirm-email/${token}`),
  requestPasswordReset: (email) => api.post('/auth/password-reset', { email }),
  confirmPasswordReset: (token, password, passwordConfirmation) =>
    api.post(`/auth/password-reset/${token}`, { password, passwordConfirmation }),
};

