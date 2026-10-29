import axios from 'axios'

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const TOKEN_KEY = 'enjz.token'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('enjz:unauthorized'))
    }

    return Promise.reject(error)
  }
)

export function getErrorMessage(error, fallback = 'Something went wrong') {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  )
}

export function getFieldErrors(error) {
  const errors = error?.response?.data?.errors

  if (!Array.isArray(errors)) {
    return {}
  }

  return errors.reduce((acc, issue) => {
    if (issue?.path) {
      acc[issue.path] = issue.message
    }
    return acc
  }, {})
}
