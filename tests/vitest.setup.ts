// vitest.setup.ts - Global test setup
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables
vi.stubEnv('DEV', true)
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000/api')

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Suppress console errors in tests (comment out if debugging)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}
