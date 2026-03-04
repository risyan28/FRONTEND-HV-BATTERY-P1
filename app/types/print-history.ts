// app/types/print-history.ts

/**
 * Representasi data riwayat cetak label dari backend
 * Sesuai schema tabel seperti TB_R_PRINT_HISTORY atau sejenisnya
 */
export interface PrintHistory {
  id: number // Zod schema transforms to number
  battery_pack_id?: string
  module_1_serial?: string | null
  module_2_serial?: string | null
  production_date?: string
  shift?: string | null
  print_datetime?: string
  model_battery?: string
  operator?: string | null
  status?: string | null

  // Legacy camelCase fields for backward compatibility
  batteryPackId?: string
  productionDate?: string
  timePrint?: string
  modelBattery?: string

  // Allow any additional fields due to passthrough
  [key: string]: any
}

/**
 * Payload untuk trigger re-print
 */
export interface ReprintRequest {
  id: number
  model_battery?: string
  modelBattery?: string // Legacy compatibility
}

// Tambahin di sini kalau nanti ada tipe lain, misal:
// export interface PrintHistoryFilter { from: string; to: string }
