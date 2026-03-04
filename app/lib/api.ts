import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import logger from './logger'

/**
 * Mengembalikan base URL backend.
 * - Browser runtime: otomatis ambil hostname dari window
 * - Server (SSR / build): fallback ke localhost
 */
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL

  if (typeof window === 'undefined') {
    // fallback saat SSR / server-side
    return 'http://localhost:4001/api'
  }

  const { protocol, hostname } = window.location
  const port = 4001
  return `${protocol}//${hostname}:${port}/api`
}

/**
 * Factory function untuk membuat instance Axios.
 * Dipanggil di browser runtime / event handler.
 */
export const createApi = (): AxiosInstance => {
  const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000, // Increased from 5000ms for better reliability
    headers: { 'Content-Type': 'application/json' },
  })

  // Request interceptor - log outgoing requests and add auth token
  api.interceptors.request.use(
    (config) => {
      const startTime = Date.now()
      config.metadata = { startTime } // Store for response timing

      // ✅ Add auth token to all requests (except /auth endpoints)
      if (!config.url?.startsWith('/auth')) {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }

      logger.api.request(
        config.method?.toUpperCase() || 'UNKNOWN',
        config.url || 'UNKNOWN',
        config.data,
      )

      return config
    },
    (error) => {
      logger.error('Request interceptor error', error)
      return Promise.reject(error)
    },
  )

  // Response interceptor - log responses and errors
  api.interceptors.response.use(
    (response) => {
      const duration = response.config.metadata?.startTime
        ? Date.now() - response.config.metadata.startTime
        : undefined

      logger.api.response(
        response.config.method?.toUpperCase() || 'UNKNOWN',
        response.config.url || 'UNKNOWN',
        response.status,
        duration,
      )

      return response
    },
    async (error) => {
      const originalRequest = error.config

      // Log API error
      logger.api.error(
        originalRequest?.method?.toUpperCase() || 'UNKNOWN',
        originalRequest?.url || 'UNKNOWN',
        error,
      )

      // ✅ Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retryAfterAuth) {
        originalRequest._retryAfterAuth = true

        try {
          logger.debug('Attempting to refresh token after 401')

          // Import dynamically to avoid circular dependency
          const { refreshToken } = await import('./auth')
          const newToken = await refreshToken()

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, logout user
          logger.error('Token refresh failed, logging out', refreshError)
          const { logout } = await import('./auth')
          logout()

          // Redirect to login (optional - can be handled in router)
          window.location.href = '/login'

          return Promise.reject(refreshError)
        }
      }

      // Retry logic for specific cases
      if (shouldRetry(error) && !originalRequest._retry) {
        originalRequest._retry = true
        const retryDelay = getRetryDelay(originalRequest._retryCount || 0)

        logger.warn('Retrying request', {
          url: originalRequest.url,
          attempt: (originalRequest._retryCount || 0) + 1,
          delay: retryDelay,
        })

        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, retryDelay))

        return api(originalRequest)
      }

      return Promise.reject(error)
    },
  )

  return api
}

/**
 * Determine if request should be retried
 */
function shouldRetry(error: any): boolean {
  if (!error.config) return false

  const maxRetries = 3
  const retryCount = error.config._retryCount || 0

  if (retryCount >= maxRetries) return false

  // Retry on network errors
  if (!error.response) return true

  // Retry on 5xx server errors and specific client errors
  const status = error.response.status
  return status >= 500 || status === 408 || status === 429
}

/**
 * Calculate retry delay with exponential backoff
 */
function getRetryDelay(retryCount: number): number {
  const baseDelay = 1000 // 1 second
  const maxDelay = 5000 // 5 seconds
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay)
  return delay
}

/**
 * Helper untuk mengecek koneksi backend
 */
export const checkBackendConnection = async () => {
  try {
    const api = createApi()
    const res = await api.get('/health')
    logger.info('Backend connection check successful')
    return { connected: true, data: res.data }
  } catch (error: unknown) {
    logger.error('Backend connection check failed', error)
    if (axios.isAxiosError(error)) {
      return { connected: false, error: error.message }
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, error: message }
  }
}

// Type augmentation for metadata
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number
    }
    _retry?: boolean
    _retryCount?: number
    _retryAfterAuth?: boolean // For token refresh retry
  }
}
