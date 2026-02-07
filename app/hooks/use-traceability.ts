// app/hooks/use-traceability.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
import type { TraceabilityData } from '@/types/traceability'
import { traceabilityApi } from '@/services/traceabilityApi'
import { toast } from 'sonner'

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
      const result = await traceabilityApi.getByDateRange(from, to)
      setData(result)
      setFilteredData(result)
    } catch (err: any) {
      console.error('Error fetching traceability data:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to load traceability data'
      setError(msg)
      toast.error(`Backend Error: ${msg}`)
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
      const result = await traceabilityApi.getByDateRange(from, to)
      setData(result)
      setFilteredData(result)
      toast.success(`Ditemukan ${result.length} data`)
    } catch (err: any) {
      console.error('Error searching traceability data:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to search traceability data'
      setError(msg)
      toast.error(`Backend Error: ${msg}`)
      setData([])
      setFilteredData([])
    } finally {
      setIsSearching(false)
    }
  }, [dateRange])

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
  }
}
