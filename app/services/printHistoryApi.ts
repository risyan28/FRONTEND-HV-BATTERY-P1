// app/services/printHistoryApi.ts

import { createApi } from '@/lib/api'
import {
  validate,
  DateRangeSchema,
  PrintHistoryResponseSchema,
  ReprintRequestSchema,
} from '@/lib/validation'
import type { PrintHistory, ReprintRequest } from '@/lib/validation'
import logger from '@/lib/logger'

const api = createApi()

export const printHistoryApi = {
  api,
  /**
   * Cari riwayat berdasarkan rentang tanggal produksi
   */
  getByDateRange: async (from: string, to: string): Promise<PrintHistory[]> => {
    // ✅ Validate input dates
    validate(DateRangeSchema, { from, to }, 'Date range')

    logger.debug('Fetching print history', { from, to })

    const { data } = await api.get('/print-history/search', {
      params: { from, to },
    })

    // ✅ Validate response
    return validate(PrintHistoryResponseSchema, data, 'Print history response')
  },

  /**
   * Trigger re-print berdasarkan ID riwayat
   */
  reprint: async (payload: ReprintRequest): Promise<void> => {
    // ✅ Validate reprint request
    validate(ReprintRequestSchema, payload, 'Reprint request')

    logger.info('Triggering reprint', { printHistoryId: payload.id })

    await api.post(`/print-history/${payload.id}/reprint`, payload)

    logger.info('Reprint triggered successfully', {
      printHistoryId: payload.id,
    })
  },

  // Contoh ekspansi di masa depan:
  // reprintAdvanced: async (payload: ReprintRequest): Promise<void> => {
  //   validate(ReprintRequestSchema, payload, 'Advanced reprint request')
  //   await api.post('/print-history/reprint', payload)
  // },
}
