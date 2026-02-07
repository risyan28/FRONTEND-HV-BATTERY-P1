// app/services/printHistoryApi.ts

import { createApi } from '@/lib/api'
import type { PrintHistory, ReprintRequest } from '@/types/print-history'

const api = createApi()

export const printHistoryApi = {
  api,
  /**
   * Cari riwayat berdasarkan rentang tanggal produksi
   */
  getByDateRange: async (from: string, to: string): Promise<PrintHistory[]> => {
    const { data } = await api.get('/print-history/search', {
      params: { from, to },
    })
    return data
  },

  /**
   * Trigger re-print berdasarkan ID riwayat
   */
  reprint: async (payload: ReprintRequest): Promise<void> => {
    await api.post(`/print-history/${payload.id}/reprint`, payload)
  },

  // Contoh ekspansi di masa depan:
  // reprintAdvanced: async (payload: ReprintRequest): Promise<void> => {
  //   await api.post('/print-history/reprint', payload)
  // },
}
