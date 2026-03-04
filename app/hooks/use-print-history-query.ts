// hooks/use-print-history-query.ts - React Query version
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { PrintHistory, ReprintRequest } from '@/lib/validation'
import { printHistoryApi } from '@/services/printHistoryApi'
import { toast } from 'sonner'
import logger from '@/lib/logger'

export function usePrintHistoryQuery() {
  const queryClient = useQueryClient()
  const today = new Date().toISOString().split('T')[0]
  const [dateRange, setDateRange] = useState({
    from: today,
    to: today,
  })

  const [shouldFetch, setShouldFetch] = useState(false)

  // ✅ Query for fetching print history
  const query = useQuery({
    queryKey: ['printHistory', dateRange.from, dateRange.to],
    queryFn: () => printHistoryApi.getByDateRange(dateRange.from, dateRange.to),
    enabled: shouldFetch,
    staleTime: 3 * 60 * 1000, // 3 minutes
  })

  // ✅ Mutation for re-printing
  const reprintMutation = useMutation({
    mutationFn: (payload: ReprintRequest) => printHistoryApi.reprint(payload),
    onSuccess: (_, variables) => {
      toast.success(`Re-print ${variables.id} berhasil`)
      logger.info('Reprint successful', { printHistoryId: variables.id })

      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['printHistory'] })
    },
  })

  const searchByDate = () => {
    if (dateRange.from > dateRange.to) {
      toast.error('Tanggal "From" tidak boleh lebih besar dari "To"')
      return
    }

    setShouldFetch(true)
    query.refetch()
  }

  const handleRePrint = (item: PrintHistory) => {
    const payload: ReprintRequest = {
      id: item.id,
      modelBattery: item.modelBattery as string,
    }
    reprintMutation.mutate(payload)
  }

  const resetFilters = () => {
    setDateRange({ from: today, to: today })
    setShouldFetch(false)
  }

  return {
    // Data
    data: query.data || [],
    filteredData: query.data || [],

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
    handleRePrint,
    resetFilters,

    // Mutation state
    isReprinting: reprintMutation.isPending,
  }
}
