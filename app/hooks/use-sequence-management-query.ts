// hooks/use-sequence-management-query.ts - React Query version
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useRef } from 'react'
import type { SequenceState, ConfirmDialogState } from '@/types/sequence'
import { sequenceApi } from '@/services/sequenceApi'
import { toast } from 'sonner'
import logger from '@/lib/logger'

export function useSequenceManagementQuery() {
  const queryClient = useQueryClient()
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  })
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ Query for sequences
  const query = useQuery({
    queryKey: ['sequences'],
    queryFn: sequenceApi.getSequences,
    staleTime: 30 * 1000, // 30 seconds - sequences change frequently
    refetchInterval: 10 * 1000, // Auto-refetch every 10 seconds
  })

  // Normalize data
  const sequences: SequenceState = {
    current: query.data?.current ?? null,
    queue: query.data?.queue ?? [],
    completed: query.data?.completed ?? [],
    parked: query.data?.parked ?? [],
  }

  // ✅ Helper to invalidate and highlight
  const invalidateWithHighlight = (sequenceId: number) => {
    queryClient.invalidateQueries({ queryKey: ['sequences'] })
    setHighlightWithCleanup(sequenceId)
  }

  // ✅ Mutations
  const moveUpMutation = useMutation({
    mutationFn: ({ id, index }: { id: string; index: number }) =>
      sequenceApi.moveSequenceUp(id, index),
    onSuccess: (_, { id }) => {
      toast.success('Sequence moved up successfully')
      invalidateWithHighlight(parseInt(id))
    },
  })

  const moveDownMutation = useMutation({
    mutationFn: ({ id, index }: { id: string; index: number }) =>
      sequenceApi.moveSequenceDown(id, index),
    onSuccess: (_, { id }) => {
      toast.success('Sequence moved down successfully')
      invalidateWithHighlight(parseInt(id))
    },
  })

  const parkMutation = useMutation({
    mutationFn: (id: string) => sequenceApi.parkSequence(id),
    onSuccess: () => {
      toast.success('Sequence parked successfully')
      queryClient.invalidateQueries({ queryKey: ['sequences'] })
    },
  })

  const insertMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: { anchorId?: number; position?: 'beginning' | 'end' }
    }) => sequenceApi.insertSequence(id, payload),
    onSuccess: (_, { id }) => {
      toast.success('Sequence inserted successfully')
      invalidateWithHighlight(id)
    },
  })

  const removeParkedMutation = useMutation({
    mutationFn: (id: string) => sequenceApi.removeFromParked(id),
    onSuccess: () => {
      toast.success('Sequence removed from parked')
      queryClient.invalidateQueries({ queryKey: ['sequences'] })
    },
  })

  const createSequenceMutation = useMutation({
    mutationFn: sequenceApi.createSequence,
    onSuccess: () => {
      toast.success('Manual sequence injected successfully')
      queryClient.invalidateQueries({ queryKey: ['sequences'] })
    },
  })

  // Confirm dialog helpers
  const showConfirmDialog = useCallback(
    (title: string, description: string, action: () => void) => {
      setConfirmDialog({ open: true, title, description, action })
    },
    [],
  )

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, open: false }))
  }, [])

  const setHighlightWithCleanup = useCallback((id: number) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current)
    }
    setHighlightedId(id)
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedId(null)
      highlightTimeoutRef.current = null
    }, 2000)
  }, [])

  // Action wrappers with confirmation
  const moveSequenceUp = useCallback(
    (index: number) => {
      if (index === 0) return
      const sequence = sequences.queue[index]
      showConfirmDialog(
        'Move Sequence Up',
        `Are you sure you want to move sequence ${sequence.FBARCODE} up?`,
        () => moveUpMutation.mutate({ id: sequence.FID.toString(), index }),
      )
    },
    [sequences.queue, showConfirmDialog, moveUpMutation],
  )

  const moveSequenceDown = useCallback(
    (index: number) => {
      if (index === sequences.queue.length - 1) return
      const sequence = sequences.queue[index]
      showConfirmDialog(
        'Move Sequence Down',
        `Are you sure you want to move sequence ${sequence.FBARCODE} down?`,
        () => moveDownMutation.mutate({ id: sequence.FID.toString(), index }),
      )
    },
    [sequences.queue, showConfirmDialog, moveDownMutation],
  )

  const parkSequence = useCallback(
    (index: number) => {
      const sequence = sequences.queue[index]
      showConfirmDialog(
        'Park Sequence',
        `Are you sure you want to park sequence ${sequence.FBARCODE}?`,
        () => parkMutation.mutate(sequence.FID.toString()),
      )
    },
    [sequences.queue, showConfirmDialog, parkMutation],
  )

  const insertSequence = useCallback(
    (
      parkedIndex: number,
      payload: { anchorId?: number; position?: 'beginning' | 'end' },
    ) => {
      const sequence = sequences.parked[parkedIndex]
      showConfirmDialog(
        'Insert Sequence',
        `Are you sure you want to insert sequence ${sequence.FBARCODE} into the queue?`,
        () => insertMutation.mutate({ id: sequence.FID, payload }),
      )
    },
    [sequences.parked, showConfirmDialog, insertMutation],
  )

  const removeFromParked = useCallback(
    (index: number) => {
      const sequence = sequences.parked[index]
      showConfirmDialog(
        'Remove Parked Sequence',
        `Are you sure you want to remove sequence ${sequence.FBARCODE} from parked?`,
        () => removeParkedMutation.mutate(sequence.FID.toString()),
      )
    },
    [sequences.parked, showConfirmDialog, removeParkedMutation],
  )

  const onAddManualSeq = useCallback(() => {
    logger.info('Adding manual sequence')
    createSequenceMutation.mutate({
      FTYPE_BATTERY: 'E',
      FMODEL_BATTERY: 'LI-688D',
    })
  }, [createSequenceMutation])

  return {
    sequences,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    confirmDialog,
    closeConfirmDialog,
    moveSequenceUp,
    moveSequenceDown,
    parkSequence,
    insertSequence,
    removeFromParked,
    refetch: query.refetch,
    highlightedId,
    onAddManualSeq,

    // Mutation states
    isMoving: moveUpMutation.isPending || moveDownMutation.isPending,
    isParking: parkMutation.isPending,
    isInserting: insertMutation.isPending,
    isRemoving: removeParkedMutation.isPending,
    isCreating: createSequenceMutation.isPending,
  }
}
