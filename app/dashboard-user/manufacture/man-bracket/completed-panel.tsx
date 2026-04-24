'use client'

import type React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { OrderType, Sequence } from '@/hooks/use-man-bracket'
import { ORDER_TYPES, TYPE_STYLE } from './constants'

interface CompletedPanelProps {
  completedSeqs: Sequence[]
  completedByType: Record<OrderType, number>
  completedListRef: React.RefObject<HTMLDivElement | null>
}

export function CompletedPanel({
  completedSeqs,
  completedByType,
  completedListRef,
}: CompletedPanelProps): React.ReactElement {
  return (
    <motion.div
      className='w-[260px] sm:w-[340px] lg:w-[420px] xl:w-[480px] flex flex-col gap-1 min-h-0'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className='flex-1 bg-white rounded-lg shadow border border-slate-200 flex flex-col overflow-hidden min-h-0'>
        <div className='bg-green-600 text-white p-1 md:p-2 flex justify-between items-center h-7 md:h-9 sticky top-0 z-10'>
          <h3 className='font-bold text-white text-2xl'>Completed Sequence</h3>
        </div>

        <div
          ref={completedListRef}
          className='flex-1 overflow-y-auto p-1.5 space-y-1'
        >
          <AnimatePresence>
            {completedSeqs.map((seq, idx) => (
              <motion.div
                key={seq.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className='bg-muted rounded-lg p-2 md:p-3 border-l-4 border-green-500 shadow-sm mt-3 mb-3'
              >
                <div className='flex items-center justify-between mb-0.5'>
                  <span className='text-sm text-slate-500'>
                    No Seq:{' '}
                    <span className='font-bold text-slate-800'>
                      {seq.seqNo}
                    </span>
                  </span>
                  <span className='text-sm text-slate-500'>
                    Type:{' '}
                    <span className='font-bold text-slate-800'>
                      {seq.seqType}
                    </span>
                  </span>
                </div>
                <div className='text-sm text-slate-500 mb-0.5 flex items-center gap-1 min-w-0'>
                  <span>Barcode:</span>
                  <span className='font-bold text-slate-800 truncate'>
                    {seq.barcode}
                  </span>
                </div>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm text-slate-500'>
                    Time Complete:{' '}
                    <span className='font-bold text-emerald-700'>
                      {seq.completedTimeText ?? '-'}
                    </span>
                  </span>
                  <span
                    className={`text-sm font-bold px-1.5 py-0.5 rounded text-white ${TYPE_STYLE[seq.orderType].badge}`}
                  >
                    {seq.orderType}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className='flex-shrink-0 border-t border-slate-200'>
          <div className='px-2 py-1 bg-slate-800 text-slate-100 text-xl sm:text-2xl font-bold tracking-wider'>
            RESUME
          </div>
          <div className='flex gap-2 p-2'>
            {ORDER_TYPES.map((type) => (
              <div
                key={type}
                className='flex-1 bg-slate-100 border border-slate-400 p-2 sm:p-3 rounded-lg text-center shadow-sm'
              >
                <div className='text-md sm:text-md font-bold text-slate-700 tracking-wide'>
                  {type}
                </div>
                <div className='text-xl sm:text-5xl font-extrabold leading-none text-slate-900 mt-1'>
                  {completedByType[type]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
