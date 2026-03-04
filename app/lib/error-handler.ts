// lib/error-handler.ts - Centralized Error Handling
// Provides consistent error handling across the app

import { AxiosError } from 'axios'
import { toast } from 'sonner'
import logger from './logger'
import { captureException, addBreadcrumb } from './sentry'

export interface ErrorContext {
  operation: string
  userId?: string
  metadata?: Record<string, unknown>
}

export interface ErrorResult {
  userMessage: string
  technicalMessage: string
  shouldRetry: boolean
  errorCode?: string
}

/**
 * Centralized error handler for consistent error processing
 * - Logs technical details
 * - Shows user-friendly messages
 * - Determines retry strategy
 */
export function handleError(
  error: unknown,
  context: ErrorContext,
): ErrorResult {
  let userMessage = 'An unexpected error occurred. Please try again.'
  let technicalMessage = 'Unknown error'
  let shouldRetry = false
  let errorCode: string | undefined

  if (error instanceof AxiosError) {
    // API/Network errors
    const status = error.response?.status
    errorCode = `API_${status || 'NETWORK'}`

    // Extract user-facing message from backend response
    userMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      getDefaultMessageForStatus(status)

    technicalMessage = `${error.config?.method?.toUpperCase()} ${error.config?.url} -> ${status || 'NO_RESPONSE'}`

    // Determine retry strategy
    shouldRetry = !status || status >= 500 || status === 408 || status === 429

    // Log API error
    logger.api.error(
      error.config?.method || 'UNKNOWN',
      error.config?.url || 'UNKNOWN',
      error,
    )

    // Additional context logging
    logger.error('API request failed', error, {
      ...context,
      status,
      url: error.config?.url,
      method: error.config?.method,
      responseData: error.response?.data,
    })
  } else if (error instanceof Error) {
    // JavaScript errors
    errorCode = 'JS_ERROR'
    userMessage = error.message
    technicalMessage = error.stack || error.message

    logger.error('JavaScript error', error, context)
  } else {
    // Unknown error type
    errorCode = 'UNKNOWN'
    technicalMessage = String(error)

    logger.error('Unknown error type', undefined, {
      ...context,
      errorValue: error,
    })
  }

  // ✅ Add breadcrumb for Sentry debugging context
  addBreadcrumb('Error handled', {
    operation: context.operation,
    errorCode,
    shouldRetry,
  })

  // ✅ Capture exception in Sentry (logger already does this, but add context here)
  if (error instanceof Error || error instanceof AxiosError) {
    captureException(error, {
      ...context,
      errorCode,
      shouldRetry,
      userMessage,
    })
  }

  // Show toast notification
  toast.error(userMessage, {
    description: import.meta.env.DEV ? technicalMessage : undefined,
    duration: shouldRetry ? 5000 : 4000,
  })

  return {
    userMessage,
    technicalMessage,
    shouldRetry,
    errorCode,
  }
}

/**
 * Get user-friendly message based on HTTP status code
 */
function getDefaultMessageForStatus(status?: number): string {
  if (!status) return 'Network error. Please check your connection.'

  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Authentication required. Please log in.',
    403: "You don't have permission to perform this action.",
    404: 'The requested resource was not found.',
    408: 'Request timeout. Please try again.',
    409: 'Conflict with existing data. Please refresh and try again.',
    422: 'Invalid data submitted. Please check your input.',
    429: 'Too many requests. Please wait a moment.',
    500: 'Server error. Please try again later.',
    502: 'Server is temporarily unavailable. Please try again.',
    503: 'Service unavailable. Please try again later.',
    504: 'Request timeout. Please try again.',
  }

  return messages[status] || `Request failed with status ${status}`
}

/**
 * Async wrapper that handles errors automatically
 * Usage: const result = await withErrorHandling(() => api.call(), { operation: 'fetchData' })
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: ErrorContext,
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    handleError(error, context)
    return null
  }
}

/**
 * Validation error handler for Zod errors
 */
export function handleValidationError(
  error: unknown,
  context: ErrorContext,
): ErrorResult {
  if (error && typeof error === 'object' && 'issues' in error) {
    // Zod validation error
    const issues = (error as any).issues as Array<{
      path: string[]
      message: string
    }>
    const firstIssue = issues[0]
    const userMessage = `Validation error: ${firstIssue.message}`

    logger.warn('Validation failed', {
      ...context,
      issues: issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    })

    toast.error(userMessage)

    return {
      userMessage,
      technicalMessage: JSON.stringify(issues),
      shouldRetry: false,
      errorCode: 'VALIDATION_ERROR',
    }
  }

  return handleError(error, context)
}
