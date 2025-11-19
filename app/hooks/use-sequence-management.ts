'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { SequenceState, ConfirmDialogState } from '@/types/sequence'
import { sequenceApi } from '@/services/sequenceApi'
import { toast } from 'sonner'

export const useSequenceManagement = () => {
  const [sequences, setSequences] = useState<SequenceState>({
    current: null,
    queue: [],
    completed: [],
    parked: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  })

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchSequences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sequenceApi.getSequences()

      // Normalisasi biar selalu ada array kosong
      setSequences({
        current: data.current ?? null,
        queue: data.queue ?? [],
        completed: data.completed ?? [],
        parked: data.parked ?? [],
      })
      console.log('test', data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch sequences'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSequences()

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [fetchSequences])

  const showConfirmDialog = useCallback(
    (title: string, description: string, action: () => void) => {
      setConfirmDialog({
        open: true,
        title,
        description,
        action,
      })
    },
    []
  )

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, open: false }))
  }, [])

  const setHighlightWithCleanup = useCallback((id: number) => {
    // Clear existing timeout to prevent multiple timeouts
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current)
    }

    setHighlightedId(id)

    // Set new timeout with ref tracking
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedId(null)
      highlightTimeoutRef.current = null
    }, 2000) // Reduced from 3000ms to improve performance
  }, [])

  const moveSequenceUp = useCallback(
    async (index: number) => {
      if (index === 0) return

      const sequence = sequences.queue[index]
      showConfirmDialog(
        'Move Sequence Up',
        `Are you sure you want to move sequence ${sequence.FBARCODE} up?`,
        async () => {
          try {
            const updatedSequences = await sequenceApi.moveSequenceUp(
              sequence.FID.toString(),
              index
            )
            setSequences(updatedSequences)
            setHighlightWithCleanup(sequence.FID)
            toast.success('Sequence moved up successfully')
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Failed to move sequence up'
            toast.error(errorMessage)
          }
        }
      )
    },
    [sequences.queue, showConfirmDialog, setHighlightWithCleanup]
  )

  const moveSequenceDown = useCallback(
    async (index: number) => {
      if (index === sequences.queue.length - 1) return

      const sequence = sequences.queue[index]
      showConfirmDialog(
        'Move Sequence Down',
        `Are you sure you want to move sequence ${sequence.FBARCODE} down?`,
        async () => {
          try {
            const updatedSequences = await sequenceApi.moveSequenceDown(
              sequence.FID.toString(),
              index
            )
            setSequences(updatedSequences)
            setHighlightWithCleanup(sequence.FID)
            toast.success('Sequence moved down successfully')
          } catch (err) {
            const errorMessage =
              err instanceof Error
                ? err.message
                : 'Failed to move sequence down'
            toast.error(errorMessage)
          }
        }
      )
    },
    [sequences.queue, showConfirmDialog, setHighlightWithCleanup]
  )

  const parkSequence = useCallback(
    async (index: number) => {
      const sequence = sequences.queue[index]
      showConfirmDialog(
        'Park Sequence',
        `Are you sure you want to park sequence ${sequence.FBARCODE}?`,
        async () => {
          try {
            const updatedSequences = await sequenceApi.parkSequence(
              sequence.FID.toString()
            )
            setSequences(updatedSequences)
            toast.success('Sequence parked successfully')
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Failed to park sequence'
            toast.error(errorMessage)
          }
        }
      )
    },
    [sequences.queue, showConfirmDialog]
  )

  const insertSequence = useCallback(
    async (
      parkedIndex: number,
      payload: { anchorId?: number; position?: 'beginning' | 'end' }
    ) => {
      const sequence = sequences.parked[parkedIndex]

      showConfirmDialog(
        'Insert Sequence',
        `Are you sure you want to insert sequence ${sequence.FBARCODE} into the queue?`,
        async () => {
          try {
            const updatedSequences = await sequenceApi.insertSequence(
              sequence.FID, // sequence yang mau diinsert
              payload // informasi posisi
            )
            setSequences(updatedSequences)
            setHighlightWithCleanup(sequence.FID)
            toast.success('Sequence inserted successfully')
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Failed to insert sequence'
            toast.error(errorMessage)
          }
        }
      )
    },
    [sequences.parked, showConfirmDialog, setHighlightWithCleanup]
  )

  const removeFromParked = useCallback(
    async (index: number) => {
      const sequence = sequences.parked[index]
      showConfirmDialog(
        'Remove Parked Sequence',
        `Are you sure you want to remove sequence ${sequence.FBARCODE} from parked?`,
        async () => {
          try {
            const updatedSequences = await sequenceApi.removeFromParked(
              sequence.FID.toString()
            )
            setSequences(updatedSequences)
            toast.success('Sequence removed from parked')
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Failed to remove sequence'
            toast.error(errorMessage)
          }
        }
      )
    },
    [sequences.parked, showConfirmDialog]
  )

  const onAddManualSeq = useCallback(async () => {
    try {
      await sequenceApi.createSequence({
        FTYPE_BATTERY: 'E',
        FMODEL_BATTERY: 'LI-688D',
      })
      toast.success('Manual sequence injected successfully')
      await fetchSequences()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to inject sequence'
      toast.error(errorMessage)
    }
  }, [fetchSequences])

  return {
    sequences,
    loading,
    error,
    confirmDialog,
    closeConfirmDialog,
    moveSequenceUp,
    moveSequenceDown,
    parkSequence,
    insertSequence,
    removeFromParked,
    refetch: fetchSequences,
    highlightedId,
    onAddManualSeq,
  }
}
