// app/hooks/use-print-history.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
import type { PrintHistory, ReprintRequest } from '@/types/print-history'
import { printHistoryApi } from '@/services/printHistoryApi'
import { toast } from 'sonner'

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
      const result = await printHistoryApi.getByDateRange(from, to)
      setData(result)
      setFilteredData(result)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load print history'
      setError(msg)
      toast.error(msg)
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
      const result = await printHistoryApi.getByDateRange(from, to)
      setFilteredData(result)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to search print history'
      setError(msg)
      toast.error(msg)
      setFilteredData([])
    } finally {
      setIsSearching(false)
    }
  }, [dateRange]) // ✅ dependency hanya dateRange, bukan objek penuh

  const handleRePrint = useCallback(async (item: PrintHistory) => {
    try {
      console.log('item', item)
      const payload: ReprintRequest = { id: item.id, modelBattery: item.modelBattery as string }
      await printHistoryApi.reprint(payload) // ✅ kirim objek, bukan string
      toast.success(`Re-print ${item.batteryPackId} berhasil`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal re-print'
      toast.error(msg)
    }
  }, [])

  const refetch = useCallback(async () => {
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
