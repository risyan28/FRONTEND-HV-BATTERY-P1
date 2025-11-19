// Sesuai schema BE (TB_R_SEQUENCE_BATTERY di Prisma)
export interface Sequence {
  FID: number
  FID_ADJUST: number
  FSEQ_NO: number
  FTYPE_BATTERY: string
  FMODEL_BATTERY: string
  FSEQ_DATE: string // ISO string (karena dari DateTime Prisma → JSON)
  FSTATUS: number | null
  FBARCODE?: string | null
  FSEQ_K0?: string | null
  FBODY_NO_K0?: string | null
  FID_RECEIVER?: string | null
  FALC_DATA?: string | null
  FTIME_RECEIVED?: string | null
  FTIME_PRINTED?: string | null
  FTIME_COMPLETED?: string | null
}

export interface SequenceState {
  current: Sequence | null
  queue: Sequence[]
  completed: Sequence[]
  parked: Sequence[]
}

export interface ConfirmDialogState {
  open: boolean
  title: string
  description: string
  action: () => void
}

export interface CreateSequence {
  FTYPE_BATTERY: string
  FMODEL_BATTERY: string
}
