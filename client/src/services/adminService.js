import api from './api';

export const adminService = {
  listUsers:       (params) => api.get('/admin/users', { params }),
  setUserActive:   (id, is_active) => api.patch(`/admin/users/${id}`, { is_active }),
  createDoctor:    (data)   => api.post('/admin/doctors', data),
  listAppointments:(params) => api.get('/admin/appointments', { params }),
  getSummary:      ()       => api.get('/admin/reports/summary'),
};
