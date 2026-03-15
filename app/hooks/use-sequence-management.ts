'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { SequenceState, ConfirmDialogState } from '@/types/sequence'
import { sequenceApi } from '@/services/sequenceApi'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handler'
import logger from '@/lib/logger'

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

  const fetchSequences = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false

    try {
      if (!silent) {
        setLoading(true)
        setError(null)
      }
      logger.debug('Fetching sequences')

      const data = await sequenceApi.getSequences()

      // Normalisasi biar selalu ada array kosong
      setSequences({
        current: data.current ?? null,
        queue: data.queue ?? [],
        completed: data.completed ?? [],
        parked: data.parked ?? [],
      })

      logger.info('Sequences loaded', {
        currentId: data.current?.FID,
        queueCount: data.queue?.length ?? 0,
        completedCount: data.completed?.length ?? 0,
        parkedCount: data.parked?.length ?? 0,
      })
    } catch (err) {
      // ✅ Use centralized error handler
      const errorResult = handleError(err, { operation: 'fetchSequences' })
      if (!silent) {
        setError(errorResult.userMessage)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
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
    [],
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
    async (sequenceId: number) => {
      const index = sequences.queue.findIndex((seq) => seq.FID === sequenceId)
      if (index <= 0) return

      const sequence = sequences.queue[index]
      showConfirmDialog(
        'Move Sequence Up',
        `Are you sure you want to move sequence ${sequence.FBARCODE} up?`,
        async () => {
          try {
            logger.info('Moving sequence up', {
              sequenceId: sequence.FID,
              index,
            })

            const updatedSequences = await sequenceApi.moveSequenceUp(
              sequence.FID.toString(),
              index,
            )
            setSequences(updatedSequences)
            setHighlightWithCleanup(sequence.FID)
            toast.success('Sequence moved up successfully')
          } catch (err) {
            // ✅ Use centralized error handler
            handleError(err, {
              operation: 'moveSequenceUp',
              metadata: {
                sequenceId: sequence.FID,
                index,
              },
            })
          }
        },
      )
    },
    [sequences.queue, showConfirmDialog, setHighlightWithCleanup],
  )

  const moveSequenceDown = useCallback(
    async (sequenceId: number) => {
      const index = sequences.queue.findIndex((seq) => seq.FID === sequenceId)
      if (index < 0 || index === sequences.queue.length - 1) return

      const sequence = sequences.queue[index]
      showConfirmDialog(
        'Move Sequence Down',
        `Are you sure you want to move sequence ${sequence.FBARCODE} down?`,
        async () => {
          try {
            logger.info('Moving sequence down', {
              sequenceId: sequence.FID,
              index,
            })

            const updatedSequences = await sequenceApi.moveSequenceDown(
              sequence.FID.toString(),
              index,
            )
            setSequences(updatedSequences)
            setHighlightWithCleanup(sequence.FID)
            toast.success('Sequence moved down successfully')
          } catch (err) {
            // ✅ Use centralized error handler
            handleError(err, {
              operation: 'moveSequenceDown',
              metadata: {
                sequenceId: sequence.FID,
                index,
              },
            })
          }
        },
      )
    },
    [sequences.queue, showConfirmDialog, setHighlightWithCleanup],
  )

  const parkSequence = useCallback(
    async (sequenceId: number) => {
      const sequence = sequences.queue.find((seq) => seq.FID === sequenceId)
      if (!sequence) return

      showConfirmDialog(
        'Park Sequence',
        `Are you sure you want to park sequence ${sequence.FBARCODE}?`,
        async () => {
          try {
            logger.info('Parking sequence', { sequenceId: sequence.FID })

            const updatedSequences = await sequenceApi.parkSequence(
              sequence.FID.toString(),
            )
            setSequences(updatedSequences)
            toast.success('Sequence parked successfully')
          } catch (err) {
            // ✅ Use centralized error handler
            handleError(err, {
              operation: 'parkSequence',
              metadata: {
                sequenceId: sequence.FID,
              },
            })
          }
        },
      )
    },
    [sequences.queue, showConfirmDialog],
  )

  const insertSequence = useCallback(
    async (
      parkedIndex: number,
      payload: { anchorId?: number; position?: 'beginning' | 'end' },
    ) => {
      const sequence = sequences.parked[parkedIndex]

      showConfirmDialog(
        'Insert Sequence',
        `Are you sure you want to insert sequence ${sequence.FBARCODE} into the queue?`,
        async () => {
          try {
            logger.info('Inserting sequence', {
              sequenceId: sequence.FID,
              payload,
            })

            const updatedSequences = await sequenceApi.insertSequence(
              sequence.FID, // sequence yang mau diinsert
              payload, // informasi posisi
            )
            setSequences(updatedSequences)
            setHighlightWithCleanup(sequence.FID)
            toast.success('Sequence inserted successfully')
          } catch (err) {
            // ✅ Use centralized error handler
            handleError(err, {
              operation: 'insertSequence',
              metadata: {
                sequenceId: sequence.FID,
                payload,
              },
            })
          }
        },
      )
    },
    [sequences.parked, showConfirmDialog, setHighlightWithCleanup],
  )

  const removeFromParked = useCallback(
    async (index: number) => {
      const sequence = sequences.parked[index]
      showConfirmDialog(
        'Remove Parked Sequence',
        `Are you sure you want to remove sequence ${sequence.FBARCODE} from parked?`,
        async () => {
          try {
            logger.info('Removing sequence from parked', {
              sequenceId: sequence.FID,
            })

            const updatedSequences = await sequenceApi.removeFromParked(
              sequence.FID.toString(),
            )
            setSequences(updatedSequences)
            toast.success('Sequence removed from parked')
          } catch (err) {
            // ✅ Use centralized error handler
            handleError(err, {
              operation: 'removeFromParked',
              metadata: {
                sequenceId: sequence.FID,
              },
            })
          }
        },
      )
    },
    [sequences.parked, showConfirmDialog],
  )

  const onAddManualSeq = useCallback(
    async (orderType: 'ASSY' | 'CKD' | 'SERVICE PART', qty: number) => {
      try {
        logger.info('Adding manual sequence', {
          type: 'E',
          model: 'LI-688D',
          orderType,
          qty,
        })

        const updatedSequences = await sequenceApi.createSequence({
          FTYPE_BATTERY: 'E',
          FMODEL_BATTERY: 'LI-688D',
          ORDER_TYPE: orderType,
          QTY: qty,
        })

        // Apply server-returned state immediately for zero-delay UX.
        setSequences({
          current: updatedSequences.current ?? null,
          queue: updatedSequences.queue ?? [],
          completed: updatedSequences.completed ?? [],
          parked: updatedSequences.parked ?? [],
        })

        toast.success('Manual sequence injected successfully')

        // Keep data in sync if concurrent changes happen on the line.
        void fetchSequences()
      } catch (err) {
        // ✅ Use centralized error handler
        handleError(err, { operation: 'onAddManualSeq' })
      }
    },
    [fetchSequences],
  )

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
