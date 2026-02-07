// app/services/traceabilityApi.ts

import { createApi } from '@/lib/api'
import type { TraceabilityData } from '@/types/traceability'

const api = createApi()

export const traceabilityApi = {
  api,
  /**
   * Cari data traceability berdasarkan rentang tanggal produksi
   */
  getByDateRange: async (from: string, to: string): Promise<TraceabilityData[]> => {
    const { data } = await api.get('/traceability/search', {
      params: { from, to },
    })
    return data
  },

  /**
   * Get detail traceability berdasarkan battery pack ID
   */
  getByBatteryPackId: async (batteryPackId: string): Promise<TraceabilityData> => {
    const { data } = await api.get(`/traceability/${batteryPackId}`)
    return data
  },

  /**
   * Get semua data traceability
   */
  getAll: async (): Promise<TraceabilityData[]> => {
    const { data } = await api.get('/traceability')
    return data
  },
}
