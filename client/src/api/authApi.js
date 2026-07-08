import axiosClient from './axiosClient';

export const authApi = {
  signup: (payload) => axiosClient.post('/auth/signup', payload),
  checkEmail: (email) => axiosClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`),
  login: (payload) => axiosClient.post('/auth/login', payload),
  logout: () => axiosClient.post('/auth/logout'),
  refresh: () => axiosClient.post('/auth/refresh'),
  me: () => axiosClient.get('/auth/me'),
  forgotPassword: (payload) => axiosClient.post('/auth/forgot-password', payload),
  resetPassword: (payload) => axiosClient.post('/auth/reset-password', payload),
  changePassword: (payload) => axiosClient.post('/auth/change-password', payload),
};
