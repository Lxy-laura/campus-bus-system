import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
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
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (username, password) => api.post('/login', { username, password }),
  register: (username, password) => api.post('/register', { username, password }),
  getProfile: () => api.get('/users/profile'),
}

export const routeAPI = {
  getRoutes: () => api.get('/routes'),
  createRoute: (data) => api.post('/routes', data),
}

export const stopAPI = {
  getStops: () => api.get('/stops'),
  createStop: (data) => api.post('/stops', data),
}

export const scheduleAPI = {
  getSchedules: () => api.get('/schedules'),
  createSchedule: (data) => api.post('/schedules', data),
  deleteSchedule: (id) => api.delete(`/schedules/${id}`),
}

export default api
