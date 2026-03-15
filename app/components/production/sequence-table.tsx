'use client'

import type { SequenceState } from '@/types/sequence'
import { SequenceTableHeader } from './sequence-table-header'
import {
  SequenceTableColumns,
  SequenceTableHead,
} from './sequence-table-columns'
import { SequenceRow } from './sequence-row'
import { useEffect, useRef, memo } from 'react'

interface SequenceTableProps {
  sequences: SequenceState
  onMoveUp: (sequenceId: number) => void
  onMoveDown: (sequenceId: number) => void
  onPark: (sequenceId: number) => void
  highlightedId: number | null
  AddManualSeq: (
    orderType: 'ASSY' | 'CKD' | 'SERVICE PART',
    qty: number,
  ) => void
  strategyMode?: 'normal' | 'priority' | 'ratio'
}

export const SequenceTable = memo(function SequenceTable({
  sequences,
  onMoveUp,
  onMoveDown,
  onPark,
  highlightedId,
  AddManualSeq,
  strategyMode = 'normal',
}: SequenceTableProps) {
  const { current, queue, completed } = sequences
  const queueRef = useRef<HTMLDivElement | null>(null)
  const historyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (queueRef.current) {
      // Keep queue pinned at the bottom so the row nearest current RUNNING is visible.
      queueRef.current.scrollTop = queueRef.current.scrollHeight
    }

    if (historyRef.current) {
      // Keep history pinned at top.
      historyRef.current.scrollTop = 0
    }
  }, [queue, completed])

  return (
    <div className='text-xs md:text-sm'>
      <SequenceTableHeader addManualSeq={AddManualSeq} />

      <div className='overflow-x-auto -mx-2 md:mx-0'>
        <div className='min-w-[800px]'>
          <table className='w-full table-fixed'>
            <SequenceTableColumns />
            <SequenceTableHead />
          </table>

          {/* Queue Section */}
          <div
            ref={queueRef}
            className='h-[200px] md:h-[300px] overflow-y-auto'
          >
            <table className='w-full table-fixed'>
              <SequenceTableColumns />
              <tbody>
                {[...queue].reverse().map((seq, index) => (
                  <SequenceRow
                    key={`queue-${seq.FID}`}
                    sequence={seq}
                    type='queue'
                    index={index}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                    onPark={onPark}
                    queueLength={queue.length}
                    highlightedId={highlightedId === seq.FID ? seq.FID : null}
                    disableManualReorder={strategyMode !== 'normal'}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Current Sequence */}
          <table className='w-full table-fixed'>
            <SequenceTableColumns />
            <tbody>
              {current && (
                <SequenceRow
                  key={`current-${current.FID}`}
                  sequence={current}
                  type='current'
                />
              )}
            </tbody>
          </table>

          {/* Completed Section */}
          <div
            ref={historyRef}
            className='h-[200px] md:h-[300px] overflow-y-auto'
          >
            <table className='w-full table-fixed'>
              <SequenceTableColumns />
              <tbody>
                {[...completed]
                  .sort(
                    (a, b) =>
                      new Date(a.FTIME_PRINTED || 0).getTime() -
                      new Date(b.FTIME_PRINTED || 0).getTime(),
                  )
                  .map((seq) => (
                    <SequenceRow
                      key={`completed-${seq.FID}`}
                      sequence={seq}
                      type='completed'
                    />
                  ))
                  .reverse()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
})
