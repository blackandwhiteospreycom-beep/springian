import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }).then(r => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (data) => api.post('/auth/reset-password', data).then(r => r.data),
  getMe: () => api.get('/auth/me').then(r => r.data),
  updateMe: (data) => api.put('/auth/me', data).then(r => r.data),
  completeOnboarding: (data) => api.post('/auth/onboarding/complete', data).then(r => r.data),
  getServices: () => api.get('/auth/services').then(r => r.data),
  getOnboardingQuestions: (serviceSlug) => api.get(`/auth/onboarding/${serviceSlug}`).then(r => r.data),
  // Super Admin
  getOrgs: (params) => api.get('/auth/admin/organizations', { params }).then(r => r.data),
  updateOrgTier: (id, tier) => api.put(`/auth/admin/organizations/${id}/tier`, { tier }).then(r => r.data),
  suspendOrg: (id) => api.post(`/auth/admin/organizations/${id}/suspend`).then(r => r.data),
  activateOrg: (id) => api.post(`/auth/admin/organizations/${id}/activate`).then(r => r.data),
  getAdminStats: () => api.get('/auth/admin/stats').then(r => r.data),
};

// Services API (unchanged)
export const servicesAPI = {
  getAll: (params = {}) => api.get('/services', { params }).then(r => r.data),
  getOne: (id) => api.get(`/services/${id}`).then(r => r.data),
  create: (data) => api.post('/services', data).then(r => r.data),
  update: (id, data) => api.put(`/services/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/services/${id}`).then(r => r.data),
  getStats: () => api.get('/services/stats/summary').then(r => r.data),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }).then(r => r.data),
  getOne: (id) => api.get(`/users/${id}`).then(r => r.data),
  create: (data) => api.post('/users', data).then(r => r.data),
  update: (id, data) => api.put(`/users/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/users/${id}`).then(r => r.data),
  getStats: () => api.get('/users/stats/summary').then(r => r.data),
};

// Analytics API
export const analyticsAPI = {
  getMetrics: () => api.get('/analytics/metrics').then(r => r.data),
  getRevenue: () => api.get('/analytics/revenue').then(r => r.data),
  getServicePerformance: () => api.get('/analytics/service-performance').then(r => r.data),
  getUserActivity: () => api.get('/analytics/user-activity').then(r => r.data),
  getTopFeatures: () => api.get('/analytics/top-features').then(r => r.data),
};

// Settings API
export const settingsAPI = {
  getAll: () => api.get('/settings').then(r => r.data),
  getByCategory: (category) => api.get(`/settings/category/${category}`).then(r => r.data),
  update: (key, value) => api.put(`/settings/${key}`, { value }).then(r => r.data),
  bulkUpdate: (updates) => api.patch('/settings/bulk', updates).then(r => r.data),
};

export default api;
