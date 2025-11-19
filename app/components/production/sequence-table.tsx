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
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onPark: (index: number) => void
  highlightedId: number | null
  AddManualSeq: () => void
}

export const SequenceTable = memo(function SequenceTable({
  sequences,
  onMoveUp,
  onMoveDown,
  onPark,
  highlightedId,
  AddManualSeq,
}: SequenceTableProps) {
  const { current, queue, completed } = sequences
  const queueRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (queueRef.current) {
      queueRef.current.scrollTop = queueRef.current.scrollHeight
    }
  }, [queue])

  return (
    <div>
      <SequenceTableHeader addManualSeq={AddManualSeq} />

      <div className='overflow-x-auto'>
        <table className='w-full table-fixed'>
          <SequenceTableColumns />
          <SequenceTableHead />
        </table>

        {/* Queue Section */}
        <div ref={queueRef} className='h-[300px] overflow-y-auto'>
          <table className='w-full table-fixed'>
            <SequenceTableColumns />
            <tbody>
              {[...queue]
                .sort((a, b) => a.FID_ADJUST - b.FID_ADJUST)
                .map((seq, index) => (
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
                  />
                ))
                .reverse()}
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
        <div className='h-[300px] overflow-y-auto'>
          <table className='w-full table-fixed'>
            <SequenceTableColumns />
            <tbody>
              {[...completed]
                .sort(
                  (a, b) =>
                    new Date(a.FTIME_PRINTED || 0).getTime() -
                    new Date(b.FTIME_PRINTED || 0).getTime()
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
  )
})
