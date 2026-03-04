// app/hooks/use-traceability.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
import type { TraceabilityData } from '@/types/traceability'
import { traceabilityApi } from '@/services/traceabilityApi'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handler'
import logger from '@/lib/logger'

interface UseTraceabilityResult {
  data: TraceabilityData[]
  filteredData: TraceabilityData[]
  loading: boolean
  isSearching: boolean
  error: string | null
  dateRange: {
    from: string
    to: string
  }
  setDateRange: (range: { from: string; to: string }) => void
  searchByDate: () => Promise<void>
  refetch: () => Promise<void>
}

export const useTraceability = (): UseTraceabilityResult => {
  const [data, setData] = useState<TraceabilityData[]>([])
  const [filteredData, setFilteredData] = useState<TraceabilityData[]>([])
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const [dateRange, setDateRange] = useState({
    from: today,
    to: today,
  })

  const fetchAll = useCallback(async () => {
    const { from, to } = dateRange
    try {
      setLoading(true)
      setError(null)
      logger.debug('Fetching traceability data', { from, to })

      const result = await traceabilityApi.getByDateRange(from, to)
      setData(result)
      setFilteredData(result)

      logger.info('Traceability data loaded', { count: result.length })
    } catch (err) {
      // ✅ Use centralized error handler
      const errorResult = handleError(err, { operation: 'fetchAll', from, to })
      setError(errorResult.userMessage)
      setData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const searchByDate = useCallback(async () => {
    const { from, to } = dateRange

    if (from > to) {
      toast.error('Tanggal "From" tidak boleh lebih besar dari "To"')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      logger.debug('Searching traceability by date', { from, to })

      const result = await traceabilityApi.getByDateRange(from, to)
      setData(result)
      setFilteredData(result)

      toast.success(`Ditemukan ${result.length} data`)
      logger.info('Traceability search completed', { count: result.length })
    } catch (err) {
      // ✅ Use centralized error handler
      const errorResult = handleError(err, {
        operation: 'searchByDate',
        from,
        to,
      })
      setError(errorResult.userMessage)
      setData([])
      setFilteredData([])
    } finally {
      setIsSearching(false)
    }
  }, [dateRange])

  const refetch = useCallback(async () => {
    logger.debug('Refetching traceability data')
    await fetchAll()
    setDateRange({ from: today, to: today })
  }, [fetchAll, today])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    data,
    filteredData,
    loading,
    isSearching,
    error,
    dateRange,
    setDateRange,
    searchByDate,
    refetch,
  }
}
