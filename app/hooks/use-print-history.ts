// app/hooks/use-print-history.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
import type { PrintHistory, ReprintRequest } from '@/lib/validation'
import { printHistoryApi } from '@/services/printHistoryApi'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handler'
import logger from '@/lib/logger'

interface UsePrintHistoryResult {
  data: PrintHistory[]
  filteredData: PrintHistory[]
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
  handleRePrint: (item: PrintHistory) => Promise<void>
}

export const usePrintHistory = (): UsePrintHistoryResult => {
  const [data, setData] = useState<PrintHistory[]>([])
  const [filteredData, setFilteredData] = useState<PrintHistory[]>([])
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
      logger.debug('Fetching print history', { from, to })

      const result = await printHistoryApi.getByDateRange(from, to)
      setData(result)
      setFilteredData(result)

      logger.info('Print history loaded', { count: result.length })
    } catch (err) {
      // ✅ Use centralized error handler
      const errorResult = handleError(err, { operation: 'fetchAll' })
      setError(errorResult.userMessage)
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
      logger.debug('Searching print history by date', { from, to })

      const result = await printHistoryApi.getByDateRange(from, to)
      setFilteredData(result)

      logger.info('Print history search completed', { count: result.length })
    } catch (err) {
      // ✅ Use centralized error handler
      const errorResult = handleError(err, {
        operation: 'searchByDate',
      })
      setError(errorResult.userMessage)
      setFilteredData([])
    } finally {
      setIsSearching(false)
    }
  }, [dateRange])

  const handleRePrint = useCallback(async (item: PrintHistory) => {
    try {
      logger.info('Initiating reprint', {
        printHistoryId: item.id,
        batteryPackId: item.battery_pack_id,
      })

      const payload: ReprintRequest = {
        id: item.id,
      }

      await printHistoryApi.reprint(payload)
      toast.success(`Re-print ${item.battery_pack_id} berhasil`)

      logger.info('Reprint successful', { printHistoryId: item.id })
    } catch (err) {
      // ✅ Use centralized error handler
      handleError(err, { operation: 'handleRePrint' })
    }
  }, [])

  const refetch = useCallback(async () => {
    logger.debug('Refetching print history')
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
    handleRePrint,
  }
}
