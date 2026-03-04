// lib/validation.ts - Zod schemas for runtime validation
// Ensures data integrity at runtime, not just compile-time

import { z } from 'zod'
import logger from './logger'

// ==================== SEQUENCE SCHEMAS ====================

export const SequenceSchema = z.object({
  FID: z.number(),
  FID_ADJUST: z.number(),
  FSEQ_NO: z.number(),
  FTYPE_BATTERY: z.string(),
  FMODEL_BATTERY: z.string(),
  FSEQ_DATE: z.string(), // Accept any date string format from backend
  FSTATUS: z.number().nullable(),
  FBARCODE: z.string().nullable().optional(),
  FSEQ_K0: z.string().nullable().optional(),
  FBODY_NO_K0: z.string().nullable().optional(),
  FID_RECEIVER: z.string().nullable().optional(),
  FALC_DATA: z.string().nullable().optional(),
  FTIME_RECEIVED: z.string().nullable().optional(),
  FTIME_PRINTED: z.string().nullable().optional(),
  FTIME_COMPLETED: z.string().nullable().optional(),
})

export const SequenceStateSchema = z.object({
  current: SequenceSchema.nullable(),
  queue: z.array(SequenceSchema),
  completed: z.array(SequenceSchema),
  parked: z.array(SequenceSchema),
})

export const CreateSequenceSchema = z.object({
  FTYPE_BATTERY: z.string().min(1, 'Battery type is required'),
  FMODEL_BATTERY: z.string().min(1, 'Battery model is required'),
})

export const UpdateSequenceSchema = SequenceSchema.partial()

// ==================== TRACEABILITY SCHEMAS ====================

export const TraceabilityDataSchema = z
  .object({
    PACK_ID: z.string(),
    MODULE_1: z.string().optional(),
    MODULE_2: z.string().optional(),
    JUDGEMENT_VALUE: z.string().optional(),
    PRODUCTION_DATE: z.string().optional(),
    SHIFT: z.string().optional(),
    TIME_PRINT: z.string().optional(),
  })
  .passthrough() // Allow additional 1020+ dynamic fields

export const TraceabilityResponseSchema = z.array(TraceabilityDataSchema)

export const DateRangeSchema = z
  .object({
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  })
  .refine((data) => data.from <= data.to, {
    message: 'From date must be before or equal to To date',
    path: ['from'],
  })

// ==================== PRINT HISTORY SCHEMAS ====================

export const PrintHistorySchema = z
  .object({
    id: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)), // Accept string or number, convert to number
    battery_pack_id: z.string().optional(),
    module_1_serial: z.string().nullable().optional(),
    module_2_serial: z.string().nullable().optional(),
    production_date: z.string().optional(),
    print_datetime: z.string().optional(),
    shift: z.string().nullable().optional(),
    operator: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
  })
  .passthrough() // Allow additional fields from backend

export const PrintHistoryResponseSchema = z.array(PrintHistorySchema)

export const ReprintRequestSchema = z.object({
  id: z.number().positive('Invalid print history ID'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').optional(),
})

// ==================== AUTH SCHEMAS ====================

export const LoginCredentialsSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    role: z.enum(['admin', 'user', 'operator']),
    fullName: z.string().optional(),
  }),
})

// ==================== COMMON SCHEMAS ====================

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

export const HealthCheckSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.string().datetime(),
  services: z.record(z.string(), z.enum(['up', 'down'])).optional(),
})

// ==================== TYPE EXPORTS ====================

export type Sequence = z.infer<typeof SequenceSchema>
export type SequenceState = z.infer<typeof SequenceStateSchema>
export type CreateSequence = z.infer<typeof CreateSequenceSchema>
export type UpdateSequence = z.infer<typeof UpdateSequenceSchema>

export type TraceabilityData = z.infer<typeof TraceabilityDataSchema>
export type TraceabilityResponse = z.infer<typeof TraceabilityResponseSchema>
export type DateRange = z.infer<typeof DateRangeSchema>

export type PrintHistory = z.infer<typeof PrintHistorySchema>
export type PrintHistoryResponse = z.infer<typeof PrintHistoryResponseSchema>
export type ReprintRequest = z.infer<typeof ReprintRequestSchema>

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>

export type Pagination = z.infer<typeof PaginationSchema>
export type HealthCheck = z.infer<typeof HealthCheckSchema>

// ==================== VALIDATION HELPERS ====================

/**
 * Safe parse with detailed error logging
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))

    logger.error(`Validation failed${context ? ` for ${context}` : ''}`, {
      errorDetails,
      data,
    })
  }

  return result
}

/**
 * Validate or throw error
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string,
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')

      throw new Error(
        `Validation failed${context ? ` for ${context}` : ''}: ${errorMessage}`,
      )
    }
    throw error
  }
}
