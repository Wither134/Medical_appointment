import api from './api';

export const appointmentService = {
  book:        (data)   => api.post('/appointments', data),
  list:        (params) => api.get('/appointments', { params }),
  getOne:      (id)     => api.get(`/appointments/${id}`),
  patch:       (id, data) => api.patch(`/appointments/${id}`, data),
  reschedule:  (id, slot_start) => api.patch(`/appointments/${id}/reschedule`, { slot_start }),
};
