// lib/auth.ts - No authentication needed for this internal manufacturing system
// All endpoints accessible without auth

export const authManager = {
  isAuthenticated: () => true, // Always true, no auth checks
  getUser: () => null,
  logout: () => {
    // No-op
  },
}

export const isAuthenticated = () => true
export const getToken = () => null
export const logout = () => {
  // No-op
}
