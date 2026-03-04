// lib/logger.ts - Centralized Logging System
// Replaces all console.log/error/warn for better debugging & monitoring

import { captureException, captureMessage } from './sentry'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDev = import.meta.env.DEV
  private minLevel: LogLevel = this.isDev ? 'debug' : 'info'

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel]
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private sendToBackend(
    _level: LogLevel,
    _message: string,
    _context?: LogContext,
  ) {
    // Disabled - no backend log endpoint available
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
    this.sendToBackend('warn', message, context)

    // ✅ Send warnings to Sentry
    if (!this.isDev) {
      captureMessage(`[WARN] ${message}`, 'warning')
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
      }
      console.error(this.formatMessage('error', message, errorContext))
    }
    this.sendToBackend('error', message, { ...context, error })

    // ✅ Send errors to Sentry
    if (!this.isDev) {
      if (error instanceof Error) {
        captureException(error, { ...context, logMessage: message })
      } else {
        captureMessage(`[ERROR] ${message}`, 'error')
      }
    }
  }

  // Socket-specific logging
  socket = {
    connected: (socketId: string) => {
      this.info('Socket connected', { socketId, event: 'connect' })
    },
    disconnected: (reason: string, socketId?: string) => {
      this.warn('Socket disconnected', {
        reason,
        socketId,
        event: 'disconnect',
      })
    },
    error: (error: Error | string) => {
      this.error('Socket error', error, { event: 'socket_error' })
    },
    reconnecting: (attempt: number) => {
      this.info('Socket reconnecting', { attempt, event: 'reconnect' })
    },
  }

  // API-specific logging
  api = {
    request: (method: string, url: string, data?: any) => {
      this.debug('API request', { method, url, data, event: 'api_request' })
    },
    response: (
      method: string,
      url: string,
      status: number,
      duration?: number,
    ) => {
      this.debug('API response', {
        method,
        url,
        status,
        duration,
        event: 'api_response',
      })
    },
    error: (method: string, url: string, error: Error | unknown) => {
      this.error('API error', error, { method, url, event: 'api_error' })
    },
  }
}

// Export singleton instance
const logger = new Logger()
export default logger
