// lib/auth.ts - Authentication & Authorization System
// Handles JWT tokens, session management, and protected routes

import { createApi } from './api'
import logger from './logger'
import { setUser as setSentryUser } from './sentry'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'

export interface User {
  id: string
  username: string
  email?: string
  role: 'admin' | 'user' | 'viewer'
  permissions: string[]
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

class AuthManager {
  private api = createApi()
  private refreshPromise: Promise<string> | null = null

  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      logger.info('Attempting to log in', { username: credentials.username })

      const { data } = await this.api.post<LoginResponse>(
        '/auth/login',
        credentials,
      )

      // Store tokens
      this.setToken(data.token)
      this.setRefreshToken(data.refreshToken)
      this.setUser(data.user)

      // Set user in Sentry for error tracking
      setSentryUser({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
      })

      logger.info('Login successful', {
        userId: data.user.id,
        role: data.user.role,
      })

      return data.user
    } catch (error) {
      logger.error('Login failed', error)
      throw error
    }
  }

  /**
   * Logout and clear session
   */
  logout() {
    logger.info('Logging out')

    // Clear tokens
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)

    // Clear Sentry user
    setSentryUser(null)

    // Optionally call logout endpoint
    this.api.post('/auth/logout').catch(() => {
      // Ignore errors on logout endpoint
    })
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        logger.debug('Refreshing access token')

        const { data } = await this.api.post<{
          token: string
          refreshToken: string
        }>('/auth/refresh', { refreshToken })

        this.setToken(data.token)
        this.setRefreshToken(data.refreshToken)

        logger.debug('Token refreshed successfully')

        return data.token
      } catch (error) {
        logger.error('Token refresh failed', error)
        this.logout()
        throw error
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    // Check if token is expired
    try {
      const payload = this.decodeToken(token)
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  /**
   * Get current authenticated user
   */
  getUser(): User | null {
    const userData = localStorage.getItem(USER_KEY)
    if (!userData) return null

    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getUser()
    if (!user) return false

    return user.permissions.includes(permission)
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: User['role']): boolean {
    const user = this.getUser()
    if (!user) return false

    return user.role === role || user.role === 'admin'
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }

  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  /**
   * Decode JWT token (simple base64 decode - no verification)
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1]
      return JSON.parse(atob(payload))
    } catch {
      throw new Error('Invalid token format')
    }
  }
}

// Export singleton instance
export const authManager = new AuthManager()

// Convenience exports
export const login = (credentials: LoginCredentials) =>
  authManager.login(credentials)
export const logout = () => authManager.logout()
export const isAuthenticated = () => authManager.isAuthenticated()
export const getUser = () => authManager.getUser()
export const hasPermission = (permission: string) =>
  authManager.hasPermission(permission)
export const hasRole = (role: User['role']) => authManager.hasRole(role)
export const getToken = () => authManager.getToken()
export const refreshToken = () => authManager.refreshToken()
