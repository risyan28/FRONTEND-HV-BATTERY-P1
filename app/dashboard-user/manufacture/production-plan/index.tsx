'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useSequenceManagement } from '@/hooks/use-sequence-management'
import { PageHeader } from '@/components/production/page-header'
import { SequenceTable } from '@/components/production/sequence-table'
import { ParkedSequences } from '@/components/production/parked-sequences'
import { ConfirmDialog } from '@/components/production/confirm-dialog'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Info, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { sequenceApi } from '@/services/sequenceApi'
import type { StrategyPayload } from '@/services/sequenceApi'

type StrategyMode = 'normal' | 'priority' | 'ratio'
type OrderType = 'ASSY' | 'CKD' | 'SERVICE PART'

const ORDER_TYPES: OrderType[] = ['ASSY', 'CKD', 'SERVICE PART']
const STRATEGY_MODE_LABEL: Record<StrategyMode, string> = {
  normal: 'Normal',
  priority: 'Priority',
  ratio: 'Ratio',
}

type StrategyDraft = {
  mode: StrategyMode
  priorityType: OrderType
  ratioValues: Record<OrderType, number>
}

/**
 * Normalizes any ORDER_TYPE string to its canonical OrderType.
 * Handles both exact values ("CKD") and prefixed variants ("INJECT MAN - CKD").
 */
const normalizeOrderType = (value?: string | null): OrderType | null => {
  if (!value) return null
  const upper = value.trim().toUpperCase()
  if (upper === 'ASSY' || upper.endsWith('- ASSY') || upper.endsWith('-ASSY'))
    return 'ASSY'
  if (upper === 'CKD' || upper.endsWith('- CKD') || upper.endsWith('-CKD'))
    return 'CKD'
  if (
    upper === 'SERVICE PART' ||
    upper.endsWith('- SERVICE PART') ||
    upper.endsWith('-SERVICE PART')
  )
    return 'SERVICE PART'
  return null
}

export function ProductionPlanPage() {
  const [strategyMode, setStrategyMode] = useState<StrategyMode>('normal')
  const [priorityType, setPriorityType] = useState<OrderType>('ASSY')
  const [ratioValues, setRatioValues] = useState<Record<OrderType, number>>({
    ASSY: 2,
    CKD: 1,
    'SERVICE PART': 1,
  })
  const [isApplyingStrategy, setIsApplyingStrategy] = useState(false)
  const [appliedStrategy, setAppliedStrategy] = useState<StrategyDraft>({
    mode: 'normal',
    priorityType: 'ASSY',
    ratioValues: {
      ASSY: 2,
      CKD: 1,
      'SERVICE PART': 1,
    },
  })

  // Load persisted strategy from backend on mount
  useEffect(() => {
    sequenceApi
      .getStrategy()
      .then((s) => {
        const loaded: StrategyDraft = {
          mode: s.mode,
          priorityType: s.priorityType ?? 'ASSY',
          ratioValues: s.ratioValues ?? {
            ASSY: 2,
            CKD: 1,
            'SERVICE PART': 1,
          },
        }

        setStrategyMode(loaded.mode)
        setPriorityType(loaded.priorityType)
        setRatioValues(loaded.ratioValues)
        setAppliedStrategy(loaded)
      })
      .catch(() => {
        // use defaults silently
      })
  }, [])

  const isDirty = useMemo(() => {
    return (
      strategyMode !== appliedStrategy.mode ||
      priorityType !== appliedStrategy.priorityType ||
      ratioValues.ASSY !== appliedStrategy.ratioValues.ASSY ||
      ratioValues.CKD !== appliedStrategy.ratioValues.CKD ||
      ratioValues['SERVICE PART'] !==
        appliedStrategy.ratioValues['SERVICE PART']
    )
  }, [strategyMode, priorityType, ratioValues, appliedStrategy])

  // Apply draft strategy to backend only when user confirms.
  const applyStrategy = async () => {
    if (isApplyingStrategy) return

    setIsApplyingStrategy(true)
    try {
      const payload: Partial<StrategyPayload> = {
        mode: strategyMode,
        priorityType,
        ratioValues,
      }

      await sequenceApi.setStrategy(payload)
      await refetch({ silent: true })

      setAppliedStrategy({
        mode: strategyMode,
        priorityType,
        ratioValues: { ...ratioValues },
      })
    } catch {
      // keep silent: main UI already handles data errors globally
    } finally {
      setIsApplyingStrategy(false)
    }
  }

  const {
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
    refetch,
    highlightedId,
    onAddManualSeq,
  } = useSequenceManagement()

  // Count how many queue items match each known order type (after normalization)
  const perTypeCount = useMemo<Record<OrderType, number>>(() => {
    const queue = sequences?.queue ?? []
    const counts: Record<OrderType, number> = {
      ASSY: 0,
      CKD: 0,
      'SERVICE PART': 0,
    }
    for (const seq of queue) {
      const type = normalizeOrderType(seq.ORDER_TYPE)
      if (type) counts[type]++
    }
    return counts
  }, [sequences?.queue])

  const priorityMatchCount = useMemo(
    () => (strategyMode === 'priority' ? perTypeCount[priorityType] : null),
    [strategyMode, perTypeCount, priorityType],
  )

  const queueByStrategy = useMemo(() => {
    const queue = sequences?.queue ?? []
    // Ordering is applied in DB procedure, frontend only renders latest DB order.
    return queue
  }, [sequences?.queue])

  const displaySequences = useMemo(() => {
    return {
      current: sequences?.current ?? null,
      queue: queueByStrategy,
      completed: sequences?.completed ?? [],
      parked: sequences?.parked ?? [],
    }
  }, [sequences, queueByStrategy])

  const updateRatio = (type: OrderType, value: number) => {
    const clamped = Math.max(1, Math.min(9, value || 1))
    setRatioValues((prev) => {
      return { ...prev, [type]: clamped }
    })
  }

  // ✅ Error state inline
  if (error) {
    return (
      <div className='max-w-2xl mx-auto w-full px-4 py-8'>
        <div className='flex flex-col items-center justify-center min-h-[400px] text-center space-y-4'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Failed to load production data
          </h3>
          <p className='text-gray-600 max-w-md'>{error}</p>
          <Button onClick={() => void refetch()} className='mt-4'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-8xl mx-auto w-full px-2 py-2 sm:px-4 sm:py-4 lg:px-4 pb-24 md:pb-4'>
      <PageHeader isLoading={loading} title='Production Sequence Control' />

      {/* Main Content Area */}
      {loading ? (
        <div className='flex-1 px-2 sm:px-6 lg:px-8'>
          <div className='h-full rounded-xl bg-gray-200 animate-pulse' />
        </div>
      ) : (
        <div className='flex-1 flex flex-col md:flex-row gap-2 md:gap-2 px-2 sm:px-4 lg:px-0 pb-4 overflow-hidden'>
          {/* Active Queue - Full width mobile, 80% desktop */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className='w-full md:flex-8 rounded-md border border-gray-100 bg-white/80 p-2 md:p-4 shadow-sm'
          >
            <SequenceTable
              sequences={displaySequences}
              onMoveUp={moveSequenceUp}
              onMoveDown={moveSequenceDown}
              onPark={parkSequence}
              highlightedId={highlightedId}
              AddManualSeq={onAddManualSeq}
              strategyMode={appliedStrategy.mode}
            />
          </motion.div>

          {/* Parked Sequences - Full width mobile, 20% desktop */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className='w-full md:w-[380px] flex flex-col gap-2 md:gap-3 md:max-h-[calc(100vh-150px)]'
          >
            <ParkedSequences
              parkedSequences={sequences?.parked ?? []}
              onInsert={insertSequence}
              onRemove={removeFromParked}
              queueSequences={sequences?.queue ?? []}
              className='md:flex-1'
            />

            <div className='rounded-md border border-gray-200 bg-white p-3 md:p-4 shadow-sm'>
              <div className='mb-3'>
                <div className='flex items-center justify-between gap-2'>
                  <h3 className='text-sm md:text-base font-semibold text-gray-900'>
                    Sequence Strategy
                  </h3>
                  <span className='rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200'>
                    Active mode: {STRATEGY_MODE_LABEL[appliedStrategy.mode]}
                  </span>
                </div>
                <p className='text-xs text-gray-500'>
                  Configure sequence execution order by production mode.
                </p>
                <div className='mt-2 flex flex-wrap items-center gap-2 text-[11px]'>

                </div>
              </div>

              <div className='grid grid-cols-3 gap-2'>
                <Button
                  type='button'
                  variant={strategyMode === 'normal' ? 'default' : 'outline'}
                  className='h-8 text-xs'
                  disabled={isApplyingStrategy}
                  onClick={() => setStrategyMode('normal')}
                >
                  Normal
                </Button>
                <Button
                  type='button'
                  variant={strategyMode === 'priority' ? 'default' : 'outline'}
                  className='h-8 text-xs'
                  disabled={isApplyingStrategy}
                  onClick={() => setStrategyMode('priority')}
                >
                  Priority
                </Button>
                <Button
                  type='button'
                  variant={strategyMode === 'ratio' ? 'default' : 'outline'}
                  className='h-8 text-xs'
                  disabled={isApplyingStrategy}
                  onClick={() => setStrategyMode('ratio')}
                >
                  Ratio
                </Button>
              </div>

              {strategyMode === 'priority' && (
                <div className='mt-3 space-y-2'>
                  <label className='text-xs font-medium text-gray-700'>
                    Prioritize ORDER TYPE
                  </label>
                  <Select
                    value={priorityType}
                    disabled={isApplyingStrategy}
                    onValueChange={(v) => setPriorityType(v as OrderType)}
                  >
                    <SelectTrigger className='h-9'>
                      <SelectValue placeholder='Select order type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ASSY'>
                        ASSY
                        <span className='ml-1 text-gray-400'>
                          ({perTypeCount.ASSY})
                        </span>
                      </SelectItem>
                      <SelectItem value='CKD'>
                        CKD
                        <span className='ml-1 text-gray-400'>
                          ({perTypeCount.CKD})
                        </span>
                      </SelectItem>
                      <SelectItem value='SERVICE PART'>
                        SERVICE PART
                        <span className='ml-1 text-gray-400'>
                          ({perTypeCount['SERVICE PART']})
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {priorityMatchCount === 0 && (
                    <div className='flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-700'>
                      <Info className='h-3.5 w-3.5 mt-0.5 shrink-0' />
                      <span>
                        No <strong>{priorityType}</strong> sequence is currently
                        available in the queue. The queue order remains in
                        default sequence.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {strategyMode === 'ratio' && (
                <div className='mt-3 space-y-3'>
                  <div className='grid grid-cols-3 gap-2'>
                    {(ORDER_TYPES as OrderType[]).map((type) => (
                      <div key={type} className='space-y-1'>
                        <label className='text-[11px] font-medium text-gray-700'>
                          {type}
                          <span className='ml-1 text-gray-400'>
                            ({perTypeCount[type]})
                          </span>
                        </label>
                        <input
                          type='number'
                          min={1}
                          max={9}
                          disabled={isApplyingStrategy}
                          value={ratioValues[type]}
                          onChange={(e) =>
                            updateRatio(type, Number(e.target.value))
                          }
                          className='h-9 w-full rounded-md border px-2 text-sm'
                        />
                      </div>
                    ))}
                  </div>

                  {(ORDER_TYPES as OrderType[]).some(
                    (type) => perTypeCount[type] === 0,
                  ) && (
                    <div className='flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-700'>
                      <Info className='h-3.5 w-3.5 mt-0.5 shrink-0' />
                      <span>
                        Some ORDER TYPE values are not present in the queue:{' '}
                        <strong>
                          {(ORDER_TYPES as OrderType[])
                            .filter((type) => perTypeCount[type] === 0)
                            .join(', ')}
                        </strong>
                        . Slots for those types will be skipped.
                      </span>
                    </div>
                  )}

                  <p className='text-[11px] text-gray-500'>
                    Pattern follows SORT_ORDER from TB_M_PROD_ORDER_TYPE. Ratio:
                    ASSY:CKD:SERVICE PART = {ratioValues.ASSY}:{ratioValues.CKD}
                    :{ratioValues['SERVICE PART']}
                  </p>
                </div>
              )}

              <Button
                type='button'
                className='mt-4 h-8 w-full text-xs'
                disabled={!isDirty || isApplyingStrategy}
                onClick={() => void applyStrategy()}
              >
                {isApplyingStrategy ? (
                  <span className='inline-flex items-center gap-2'>
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    Processing...
                  </span>
                ) : (
                  'Set Strategy'
                )}
              </Button>

              {appliedStrategy.mode !== 'normal' && (
                <p className='mt-3 text-[11px] text-amber-600'>
                  Move up/down is disabled while Priority/Ratio mode is active.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        confirmDialog={confirmDialog}
        onClose={closeConfirmDialog}
      />
    </div>
  )
}
