// hooks/use-traceability-query.ts - React Query version
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { TraceabilityData } from '@/types/traceability'
import { traceabilityApi } from '@/services/traceabilityApi'
import { toast } from 'sonner'

export function useTraceabilityQuery() {
  const today = new Date().toISOString().split('T')[0]
  const [dateRange, setDateRange] = useState({
    from: today,
    to: today,
  })

  const [shouldFetch, setShouldFetch] = useState(false)

  // ✅ React Query handles loading, error, caching automatically
  const query = useQuery({
    queryKey: ['traceability', dateRange.from, dateRange.to],
    queryFn: () => traceabilityApi.getByDateRange(dateRange.from, dateRange.to),
    enabled: shouldFetch, // Only fetch when Search button clicked
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  })

  const searchByDate = () => {
    if (dateRange.from > dateRange.to) {
      toast.error('Tanggal "From" tidak boleh lebih besar dari "To"')
      return
    }

    setShouldFetch(true)
    query.refetch()
  }

  const resetFilters = () => {
    setDateRange({ from: today, to: today })
    setShouldFetch(false)
  }

  return {
    // Data
    data: query.data || [],
    filteredData: query.data || [], // Can add client-side filtering here if needed

    // States
    loading: query.isLoading,
    isSearching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,

    // Date range
    dateRange,
    setDateRange,

    // Actions
    searchByDate,
    refetch: query.refetch,
    resetFilters,

    // React Query metadata
    isStale: query.isStale,
    dataUpdatedAt: query.dataUpdatedAt,
  }
}
