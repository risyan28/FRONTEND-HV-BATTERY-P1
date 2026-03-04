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

const api = createApi()

export const sequenceApi = {
  api,

  getSequences: async (): Promise<SequenceState> => {
    const { data } = await api.get('/sequences')

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

  createSequence: async (
    payload: CreateSequence,
  ): Promise<{ success: boolean }> => {
    // ✅ Validate input before sending
    const validated = validate(
      CreateSequenceSchema,
      payload,
      'createSequence input',
    )

    logger.debug('Creating sequence', { payload: validated })
    const { data } = await api.post('/sequences', validated)
    return data
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
}
