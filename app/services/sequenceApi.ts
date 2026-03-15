// app\services\sequenceApi.ts

import { createApi } from '@/lib/api'
import { validate, safeParse } from '@/lib/validation'
import {
  SequenceStateSchema,
  CreateSequenceSchema,
  UpdateSequenceSchema,
  type SequenceState,
  type Sequence,
  type CreateSequence,
} from '@/lib/validation'
import logger from '@/lib/logger'
import { z } from 'zod'

type CanonicalOrderType = 'ASSY' | 'CKD' | 'SERVICE PART'

const toCanonicalOrderType = (
  value: unknown,
): CanonicalOrderType | undefined => {
  if (typeof value !== 'string') return undefined
  const upper = value.trim().toUpperCase()
  if (upper === 'ASSY') return 'ASSY'
  if (upper === 'CKD') return 'CKD'
  if (
    upper === 'SERVICE PART' ||
    upper === 'SERVICE_PART' ||
    upper === 'SERVICEPART'
  ) {
    return 'SERVICE PART'
  }
  return undefined
}

const normalizeRatioValues = (value: unknown) => {
  if (!value || typeof value !== 'object') return undefined
  const raw = value as Record<string, unknown>
  const read = (keys: string[]) => {
    for (const key of keys) {
      if (key in raw) return raw[key]
    }
    return undefined
  }

  return {
    ASSY: read(['ASSY', 'Assy', 'assy']),
    CKD: read(['CKD', 'Ckd', 'ckd']),
    'SERVICE PART': read([
      'SERVICE PART',
      'Service Part',
      'service part',
      'SERVICE_PART',
      'Service_Part',
      'service_part',
      'SERVICEPART',
      'ServicePart',
      'servicepart',
    ]),
  }
}

const OrderTypeEnum = z.enum(['ASSY', 'CKD', 'SERVICE PART'])
export const StrategySchema = z.object({
  mode: z.enum(['normal', 'priority', 'ratio']),
  priorityType: OrderTypeEnum.optional(),
  ratioPrimary: OrderTypeEnum.optional(),
  ratioSecondary: OrderTypeEnum.optional(),
  ratioTertiary: OrderTypeEnum.optional(),
  ratioValues: z
    .object({
      ASSY: z.number(),
      CKD: z.number(),
      'SERVICE PART': z.number(),
    })
    .optional(),
})
export type StrategyPayload = z.infer<typeof StrategySchema>

const api = createApi()

export const sequenceApi = {
  api,

  getSequences: async (): Promise<SequenceState> => {
    const { data } = await api.get('/sequences?fresh=1')

    // ✅ Validate response shape
    const validated = validate(
      SequenceStateSchema,
      data,
      'getSequences response',
    )
    return validated
  },

  updateSequenceOrder: async (sequences: Sequence[]): Promise<void> => {
    await api.put('/sequences/order', { sequences })
  },

  moveSequenceUp: async (
    sequenceId: string,
    currentIndex: number,
  ): Promise<SequenceState> => {
    const { data } = await api.patch(`/sequences/${sequenceId}/move-up`, {
      currentIndex,
    })

    return validate(SequenceStateSchema, data, 'moveSequenceUp response')
  },

  moveSequenceDown: async (
    sequenceId: string,
    currentIndex: number,
  ): Promise<SequenceState> => {
    const { data } = await api.patch(`/sequences/${sequenceId}/move-down`, {
      currentIndex,
    })

    return validate(SequenceStateSchema, data, 'moveSequenceDown response')
  },

  parkSequence: async (sequenceId: string): Promise<SequenceState> => {
    const { data } = await api.patch(`/sequences/${sequenceId}/park`)
    return validate(SequenceStateSchema, data, 'parkSequence response')
  },

  insertSequence: async (
    sequenceId: number,
    payload: { anchorId?: number; position?: 'beginning' | 'end' },
  ): Promise<SequenceState> => {
    const { data } = await api.patch(`/sequences/${sequenceId}/insert`, payload)
    return validate(SequenceStateSchema, data, 'insertSequence response')
  },

  removeFromParked: async (sequenceId: string): Promise<SequenceState> => {
    const { data } = await api.delete(`/sequences/${sequenceId}/parked`)
    return validate(SequenceStateSchema, data, 'removeFromParked response')
  },

  createSequence: async (payload: CreateSequence): Promise<SequenceState> => {
    // ✅ Validate input before sending
    const validated = validate(
      CreateSequenceSchema,
      payload,
      'createSequence input',
    )

    logger.debug('Creating sequence', { payload: validated })
    const { data } = await api.post('/sequences', validated)
    return validate(SequenceStateSchema, data, 'createSequence response')
  },

  updateSequence: async (
    sequenceId: string,
    updates: Partial<Sequence>,
  ): Promise<Sequence> => {
    // ✅ Validate partial updates
    const result = safeParse(
      UpdateSequenceSchema,
      updates,
      'updateSequence input',
    )

    if (!result.success) {
      throw new Error('Invalid update data: ' + result.error.message)
    }

    const { data } = await api.put(`/sequences/${sequenceId}`, result.data)
    return data
  },

  deleteSequence: async (sequenceId: string): Promise<void> => {
    await api.delete(`/sequences/${sequenceId}`)
    logger.info('Sequence deleted', { sequenceId })
  },

  getStrategy: async (): Promise<StrategyPayload> => {
    const { data } = await api.get('/sequences/strategy')
    return data as StrategyPayload
  },

  setStrategy: async (
    strategy: Partial<StrategyPayload>,
  ): Promise<StrategyPayload> => {
    const payload: Partial<StrategyPayload> = {
      ...strategy,
      priorityType: toCanonicalOrderType(strategy.priorityType),
      ratioPrimary: toCanonicalOrderType(strategy.ratioPrimary),
      ratioSecondary: toCanonicalOrderType(strategy.ratioSecondary),
      ratioTertiary: toCanonicalOrderType(strategy.ratioTertiary),
      ratioValues: normalizeRatioValues(strategy.ratioValues) as
        | StrategyPayload['ratioValues']
        | undefined,
    }

    const { data } = await api.put('/sequences/strategy', payload)
    return data as StrategyPayload
  },
}
