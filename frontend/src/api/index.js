import api from './axios'

// 认证相关
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data)
}

// 学员相关
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  enroll: (data) => api.post('/students/enroll', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  assignRoom: (id, data) => api.post(`/students/${id}/assign-room`, data),
  assignInstructor: (id, data) => api.post(`/students/${id}/assign-instructor`, data),
  uploadPassport: (formData) => api.post('/students/upload-passport', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 房间相关
export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  getStatus: () => api.get('/rooms/status'),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`)
}

// 船只相关
export const boatAPI = {
  getAll: (params) => api.get('/boats', { params }),
  getById: (id) => api.get(`/boats/${id}`),
  create: (data) => api.post('/boats', data),
  update: (id, data) => api.put(`/boats/${id}`, data),
  delete: (id) => api.delete(`/boats/${id}`)
}

// 课程相关
export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`)
}

// 员工相关
export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  getAvailableInstructors: () => api.get('/staff/instructors/available'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`)
}

// 行程相关
export const tripAPI = {
  getAll: (params) => api.get('/trips', { params }),
  getById: (id) => api.get(`/trips/${id}`),
  getTomorrow: () => api.get('/trips/tomorrow'),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  addParticipant: (id, data) => api.post(`/trips/${id}/participants`, data),
  removeParticipant: (id, data) => api.delete(`/trips/${id}/participants`, { data })
}

// 装备相关
export const equipmentAPI = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  assign: (id, data) => api.post(`/equipment/${id}/assign`, data),
  return: (data) => api.post('/equipment/return', data)
}

// 二维码相关
export const qrcodeAPI = {
  getEnrollmentQRCode: () => api.get('/qrcode/enrollment'),
  generateCustom: (data) => api.post('/qrcode/custom', data)
}

export default api
