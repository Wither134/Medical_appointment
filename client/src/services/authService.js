import api from './api';

export const authService = {
  register: (data)          => api.post('/auth/register', data),
  login:    (data)          => api.post('/auth/login', data),
  logout:   (refresh_token) => api.post('/auth/logout', { refresh_token }),
  refresh:  (refresh_token) => api.post('/auth/refresh', { refresh_token }),
  me:       ()              => api.get('/auth/me'),
};
