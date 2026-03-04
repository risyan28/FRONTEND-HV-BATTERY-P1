// app/services/traceabilityApi.ts

import { createApi } from '@/lib/api'
import {
  validate,
  DateRangeSchema,
  TraceabilityResponseSchema,
} from '@/lib/validation'
import type { TraceabilityData } from '@/types/traceability'
import logger from '@/lib/logger'

const api = createApi()

export const traceabilityApi = {
  api,
  /**
   * Cari data traceability berdasarkan rentang tanggal produksi
   */
  getByDateRange: async (
    from: string,
    to: string,
  ): Promise<TraceabilityData[]> => {
    // ✅ Validate input dates
    validate(DateRangeSchema, { from, to }, 'Date range')

    logger.debug('Fetching traceability data', { from, to })

    const { data } = await api.get('/traceability/search', {
      params: { from, to },
      timeout: 30000, // 30s for large datasets (1020+ columns)
    })

    // ✅ Validate response and cast to UI TraceabilityData interface
    return validate(
      TraceabilityResponseSchema,
      data,
      'Traceability response',
    ) as unknown as TraceabilityData[]
  },

  /**
   * Get detail traceability berdasarkan battery pack ID
   */
  getByBatteryPackId: async (
    batteryPackId: string,
  ): Promise<TraceabilityData> => {
    if (!batteryPackId || batteryPackId.trim().length === 0) {
      throw new Error('Battery Pack ID is required')
    }

    logger.debug('Fetching traceability by pack ID', { batteryPackId })

    const { data } = await api.get(`/traceability/${batteryPackId}`)

    // Validate single item - wrap in array for schema, then unwrap
    const validated = validate(
      TraceabilityResponseSchema,
      [data],
      'Traceability by ID',
    ) as unknown as TraceabilityData[]
    return validated[0]
  },

  /**
   * Get semua data traceability
   */
  getAll: async (): Promise<TraceabilityData[]> => {
    logger.warn('Fetching ALL traceability data - this may be slow')

    const { data } = await api.get('/traceability', {
      timeout: 60000, // 60s for potentially huge dataset
    })

    return validate(
      TraceabilityResponseSchema,
      data,
      'Traceability getAll',
    ) as unknown as TraceabilityData[]
  },
}
