// lib/__tests__/error-handler.test.ts
import { describe, it, expect, vi } from 'vitest'
import { AxiosError } from 'axios'
import { handleError } from '../error-handler'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('../logger', () => ({
  default: {
    error: vi.fn(),
    api: {
      error: vi.fn(),
    },
  },
}))

vi.mock('../sentry', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}))

describe('handleError', () => {
  it('should handle AxiosError with response', () => {
    const axiosError = new AxiosError(
      'Request failed',
      '500',
      undefined,
      {},
      {
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'Database connection failed' },
        headers: {},
        config: {} as any,
      },
    )

    const result = handleError(axiosError, { operation: 'fetchData' })

    expect(result.userMessage).toBe('Database connection failed')
    expect(result.shouldRetry).toBe(true)
    expect(result.errorCode).toBe('API_500')
  })

  it('should handle AxiosError without response (network error)', () => {
    const axiosError = new AxiosError('Network Error')
    axiosError.config = { method: 'GET', url: '/api/test' } as any

    const result = handleError(axiosError, { operation: 'fetchData' })

    expect(result.userMessage).toContain('Network error')
    expect(result.shouldRetry).toBe(true)
    expect(result.errorCode).toBe('API_NETWORK')
  })

  it('should handle regular JavaScript Error', () => {
    const error = new Error('Something went wrong')

    const result = handleError(error, { operation: 'processData' })

    expect(result.userMessage).toBe('Something went wrong')
    expect(result.errorCode).toBe('JS_ERROR')
  })

  it('should handle unknown error type', () => {
    const error = 'string error'

    const result = handleError(error, { operation: 'unknownOp' })

    expect(result.errorCode).toBe('UNKNOWN')
    expect(result.technicalMessage).toBe('string error')
  })

  it('should not retry client errors (4xx)', () => {
    const axiosError = new AxiosError(
      'Bad Request',
      '400',
      undefined,
      {},
      {
        status: 400,
        statusText: 'Bad Request',
        data: {},
        headers: {},
        config: {} as any,
      },
    )

    const result = handleError(axiosError, { operation: 'submitForm' })

    expect(result.shouldRetry).toBe(false)
  })

  it('should retry server errors (5xx)', () => {
    const axiosError = new AxiosError(
      'Service Unavailable',
      '503',
      undefined,
      {},
      {
        status: 503,
        statusText: 'Service Unavailable',
        data: {},
        headers: {},
        config: {} as any,
      },
    )

    const result = handleError(axiosError, { operation: 'fetchData' })

    expect(result.shouldRetry).toBe(true)
  })

  it('should retry timeout errors (408)', () => {
    const axiosError = new AxiosError(
      'Timeout',
      '408',
      undefined,
      {},
      {
        status: 408,
        statusText: 'Request Timeout',
        data: {},
        headers: {},
        config: {} as any,
      },
    )

    const result = handleError(axiosError, { operation: 'slowRequest' })

    expect(result.shouldRetry).toBe(true)
  })
})
