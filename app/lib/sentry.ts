// lib/sentry.ts - Error tracking and monitoring with Sentry
// Captures errors, performance metrics, and user feedback

import * as Sentry from '@sentry/react'

const isDev = import.meta.env.DEV
const dsn = import.meta.env.VITE_SENTRY_DSN

export function initSentry() {
  // Skip initialization in development or if no DSN provided
  if (isDev || !dsn) {
    console.log('[Sentry] Skipped initialization (dev mode or no DSN)')
    return
  }

  Sentry.init({
    dsn,

    // Set environment
    environment: import.meta.env.MODE || 'production',

    // Release version from package.json or env
    release: import.meta.env.VITE_APP_VERSION || 'unknown',

    // Performance Monitoring
    integrations: [
      // Automatic instrumentation
      Sentry.browserTracingIntegration({
        // Trace all React Router navigation
        enableInp: true,
      }),
      // Replay sessions on error (privacy-safe)
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring sample rate
    // 100% in production (adjust based on traffic)
    tracesSampleRate: 1.0,

    // Session Replay sample rate
    // Only replay sessions with errors to save quota
    replaysSessionSampleRate: 0.0, // Don't record all sessions
    replaysOnErrorSampleRate: 1.0, // Record all sessions with errors

    // Filter out non-critical errors
    beforeSend(event, hint) {
      const error = hint.originalException

      // Ignore browser extension errors
      if (error instanceof Error) {
        if (
          error.message.includes('Extension context invalidated') ||
          error.message.includes('message channel closed') ||
          error.message.includes('chrome-extension://')
        ) {
          return null // Don't send to Sentry
        }
      }

      // Ignore network errors with status < 500 (client errors)
      if (event.exception?.values?.[0]?.type === 'AxiosError') {
        const status = (error as any)?.response?.status
        if (status && status < 500) {
          return null // Client errors aren't server issues
        }
      }

      return event
    },

    // Add custom tags
    initialScope: {
      tags: {
        app: 'hv-battery-p1',
        platform: 'web',
      },
    },
  })

  console.log('[Sentry] Initialized successfully')
}

/**
 * Capture exception manually
 */
export function captureException(
  error: unknown,
  context?: Record<string, any>,
) {
  if (isDev) {
    console.error('[Sentry] Would capture exception:', error, context)
    return
  }

  Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * Capture custom message
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
) {
  if (isDev) {
    console.log(`[Sentry] Would capture ${level}:`, message)
    return
  }

  Sentry.captureMessage(message, level)
}

/**
 * Set user context for error tracking
 */
export function setUser(
  user: { id: string; username?: string; email?: string } | null,
) {
  Sentry.setUser(user)
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  })
}

// Export Sentry instance for advanced usage
export { Sentry }
