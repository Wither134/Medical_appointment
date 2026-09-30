import api from './api';

export const doctorService = {
  list:          (params)          => api.get('/doctors', { params }),
  getOne:        (id)              => api.get(`/doctors/${id}`),
  getSlots:      (id, date)        => api.get(`/doctors/${id}/slots`, { params: { date } }),
  getSpecialties: ()               => api.get('/doctors/specialties'),
};

export const availabilityService = {
  get:         ()      => api.get('/availability'),
  update:      (data)  => api.put('/availability', data),
  getLeaves:   ()      => api.get('/availability/leaves'),
  addLeave:    (data)  => api.post('/availability/leaves', data),
  deleteLeave: (id)    => api.delete(`/availability/leaves/${id}`),
};
