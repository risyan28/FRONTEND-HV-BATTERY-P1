// app/types/traceability.ts

/**
 * Representasi data traceability dari backend
 * Struktur dinamis dengan 1000+ fields
 */
export interface TraceabilityData {
  // Main Info
  PACK_ID: string
  MODULE_1: string
  MODULE_2: string
  LIFETIME_MODULE1_InspModule: string
  LIFETIME_MODULE2_InspModule: string
  JUDGEMENT_VALUE: string
  UNLOADING_TIME: string
  LIFETIME_MODULE1_FinalJudge: string
  LIFETIME_MODULE2_FinalJudge: string
  
  // Judgements
  JUDGE_INSP_MACHINE: string
  JUDGE_MAN_ASSY_1: string
  JUDGE_MAN_ASSY_2: string
  JUDGE_MAN_ASSY_3: string
  JUDGE_INSP_MODULE: string
  JUDGE_LABEL_CAM: string
  OVERALL_JUDGEMENT: string
  
  // Dynamic fields for Manual Work stations and sequences
  [key: string]: any
}

/**
 * Filter untuk pencarian traceability
 */
export interface TraceabilityFilter {
  from: string
  to: string
}

