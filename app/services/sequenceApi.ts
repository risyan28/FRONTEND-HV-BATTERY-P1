// app\services\sequenceApi.ts

import { createApi } from '@/lib/api'
import type { Sequence, SequenceState, CreateSequence } from '@/types/sequence'

const api = createApi()

export const sequenceApi = {
  api,
  getSequences: async (): Promise<SequenceState> => {
    const { data } = await api.get('/sequences')
    return data
  },

  updateSequenceOrder: async (sequences: Sequence[]): Promise<void> => {
    await api.put('/sequences/order', { sequences })
  },

  moveSequenceUp: async (
    sequenceId: string,
    currentIndex: number
  ): Promise<SequenceState> => {
    const { data } = await api.patch(`/sequences/${sequenceId}/move-up`, {
      currentIndex,
    })
    return data
  },

  moveSequenceDown: async (
    sequenceId: string,
    currentIndex: number
  ): Promise<SequenceState> => {
    const { data } = await api.patch(`/sequences/${sequenceId}/move-down`, {
      currentIndex,
    })
    return data
  },

  parkSequence: async (sequenceId: string): Promise<SequenceState> => {
    const { data } = await api.patch(`/sequences/${sequenceId}/park`)
    return data
  },

  insertSequence: async (
    sequenceId: number,
    payload: { anchorId?: number; position?: 'beginning' | 'end' }
  ): Promise<SequenceState> => {
    const { data } = await api.patch(`/sequences/${sequenceId}/insert`, payload)
    return data
  },

  removeFromParked: async (sequenceId: string): Promise<SequenceState> => {
    const { data } = await api.delete(`/sequences/${sequenceId}/parked`)
    return data
  },

  createSequence: async (
    payload: CreateSequence
  ): Promise<{ success: boolean }> => {
    const { data } = await api.post('/sequences', payload)
    return data
  },

  updateSequence: async (
    sequenceId: string,
    updates: Partial<Sequence>
  ): Promise<Sequence> => {
    const { data } = await api.put(`/sequences/${sequenceId}`, updates)
    return data
  },

  deleteSequence: async (sequenceId: string): Promise<void> => {
    await api.delete(`/sequences/${sequenceId}`)
  },
}
