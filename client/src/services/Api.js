import axios from 'axios';
import { getUserId, getSession } from '../Auth/AuthHelpers';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('JwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const userId = getUserId();
  const session = getSession();

  if (userId) {
    config.headers['X-User-Id'] = userId;  
  }

  if (session) {
    config.headers['X-Session'] = session;  
  }

  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),

  changePassword: (data) => api.put('/auth/change-password', data),

  logout: () => api.post('/auth/logout'),

};

export const userAPI = {
  getAllBySession: () => api.get('/users'),

  getByIdBySession: (id) => api.get(`/users/${id}`),

  createBySession: (data) => api.post('/users', data),

  updateBySession: (id, data) => api.patch(`/users/${id}`, data),

  deleteBySession: (id) => api.delete(`/users/${id}`),

  getMyProfile: () => api.get('/users/me/profile'),

  updateMyProfile: (data) => api.patch('/users/me/profile', data),
    
};

export const absenceAPI = {
  getAll: () => api.get('/absences'),

  add: (data) => api.post('/absences', data),

  update: (id, data) => api.put(`/absences/${id}`, data),

  delete: (id) => api.delete(`/absences/${id}`)
};

export const employeeAPI = {
  getAll: () => api.get('/employees'),

  add: (data) => api.post('/employees', data),

  update: (id, data) => api.put(`/employees/${id}`, data),

  delete: (id) => api.delete(`/employees/${id}`)
};

export const productAPI = {
  getAll: () => api.get('/products'),

  getLowStock: () => api.get('/products/low-stock'),

  add: (data) => api.post('/products', data),

  update: (id, data) => api.put(`/products/${id}`, data),

  delete: (id) => api.delete(`/products/${id}`)
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),

  getRecent: () => api.get('/transactions/recent'),

  add: (data) => api.post('/transactions', data),

  update: (id, data) => api.put(`/transactions/${id}`, data),

  delete: (id) => api.delete(`/transactions/${id}`)
};
  

export default api;