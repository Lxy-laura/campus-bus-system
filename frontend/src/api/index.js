import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

export const authAPI = {
  register: (username, password) =>
    api.post('/register', { username, password }),
  login: (username, password) =>
    api.post('/login', { username, password }),
  getProfile: () =>
    api.get('/users/profile'),
}

export const routeAPI = {
  getRoutes: () =>
    api.get('/routes'),
  createRoute: (name, description) =>
    api.post('/routes', { name, description }),
}

export const scheduleAPI = {
  getSchedules: (routeId) =>
    api.get('/schedules', { params: { route_id: routeId } }),
  createSchedule: (data) =>
    api.post('/schedules', data),
  deleteSchedule: (id) =>
    api.delete(`/schedules/${id}`),
}

export const stopAPI = {
  getStops: () =>
    api.get('/stops'),
  createStop: (data) =>
    api.post('/stops', data),
}

export default api
