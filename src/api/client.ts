import axios from 'axios'
import { getToken } from '../utils/auth'

const baseURL = import.meta.env.VITE_API_BASE || '/mall-admin'

export const http = axios.create({
  baseURL,
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (resp) => resp.data,
  (error) => {
    if (error?.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
