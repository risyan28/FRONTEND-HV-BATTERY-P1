// app/types/print-history.ts

/**
 * Representasi data riwayat cetak label dari backend
 * Sesuai schema tabel seperti TB_R_PRINT_HISTORY atau sejenisnya
 */
export interface PrintHistory {
  id: string // UUID atau string ID dari DB
  batteryPackId: string // Contoh: "---PE--XXXXX1DFAM0000071"
  productionDate: string // Format: "YYYY-MM-DD" (date-only)
  shift: 'DAY' | 'NIGHT'
  timePrint: string // Format: "YYYY-MM-DD HH:mm:ss.SSS" (full timestamp)
  modelBattery: string
}

/**
 * Payload untuk trigger re-print
 */
export interface ReprintRequest {
  id: string
  modelBattery: string
}

// Tambahin di sini kalau nanti ada tipe lain, misal:
// export interface PrintHistoryFilter { from: string; to: string }
