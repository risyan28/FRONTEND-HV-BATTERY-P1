// lib/query-client.ts - React Query configuration
// Provides global cache, background refetching, and optimistic updates

import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import logger from './logger'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data settings
      staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache for 10 minutes (formerly cacheTime)

      // Refetch settings
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts

      // Retry settings
      retry: (failureCount, error: any) => {
        // Don't retry client errors (4xx)
        if (error?.response?.status && error.response.status < 500) {
          return false
        }

        // Retry up to 3 times for server errors
        return failureCount < 3
      },

      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 5000)
      },
    },

    mutations: {
      // Retry mutations only once
      retry: 1,

      // Error handling for mutations
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || error?.message || 'Mutation failed'
        logger.error('Mutation error', error)
        toast.error(message)
      },
    },
  },
})

// Enhanced query client with custom methods
export const invalidateSequences = () => {
  queryClient.invalidateQueries({ queryKey: ['sequences'] })
  logger.debug('Invalidated sequences cache')
}

export const invalidateTraceability = () => {
  queryClient.invalidateQueries({ queryKey: ['traceability'] })
  logger.debug('Invalidated traceability cache')
}

export const invalidatePrintHistory = () => {
  queryClient.invalidateQueries({ queryKey: ['printHistory'] })
  logger.debug('Invalidated print history cache')
}

export const clearAllCaches = () => {
  queryClient.clear()
  logger.info('Cleared all React Query caches')
}
