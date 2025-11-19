'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Sequence } from '@/types/sequence'

interface CompletedSectionProps {
  data: Sequence[]
}

export function CompletedSection({ data }: CompletedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // bikin data terurut sebelum di-map
  const sortedData = [...data].sort((a, b) => {
    const timeA = a.FTIME_COMPLETED ? new Date(a.FTIME_COMPLETED).getTime() : 0
    const timeB = b.FTIME_COMPLETED ? new Date(b.FTIME_COMPLETED).getTime() : 0
    return sortOrder === 'desc' ? timeA - timeB : timeB - timeA
  })
  // Auto-scroll ke bawah saat data update
  useEffect(() => {
    if (containerRef.current) {
      // scroll ke paling bawah hanya sekali (saat mount)
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [data]) // kosong → cuma sekali
  return (
    <div
      ref={containerRef}
      className='flex-[2] bg-card rounded-lg border border-border overflow-y-auto shadow-sm h-[calc(100vh-300px)]'
    >
      <div className='bg-green-600 text-white p-4 flex justify-between items-center h-11 sticky top-0 z-10'>
        <h2 className='text-2xl font-semibold'>Completed Sequence</h2>
      </div>
      <div className='p-4 space-y-3'>
        {data.length === 0 ? (
          <div className='text-center text-muted-foreground py-8 text-xl'>
            No completed sequences
          </div>
        ) : (
          sortedData.map((item) => (
            <motion.div
              key={item.FID}
              className='bg-muted rounded-lg p-2 border-l-4 border-green-500 shadow-sm'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Seq & Model */}
              <div className='flex justify-between'>
                <div>
                  <span className='text-md text-muted-foreground'>No Seq:</span>
                  <span className='ml-1 font-mono font-semibold'>
                    {item.FBARCODE?.slice(-7)}
                  </span>
                </div>
                <div>
                  <span className='text-md text-muted-foreground'>Type:</span>
                  <span className='ml-1 font-bold'>{item.FMODEL_BATTERY}</span>
                </div>
              </div>

              {/* Barcode */}
              <div className='mt-2 flex justify-between'>
                <div>
                  <span className='text-md text-muted-foreground'>
                    Barcode:
                  </span>
                  <span className='ml-1 font-mono text-md font-bold'>
                    {item.FBARCODE}
                  </span>
                </div>
              </div>

              {/* Time Complete */}
              <div className='mt-2'>
                <span className='text-md text-muted-foreground'>
                  Time Complete:
                </span>
                <span className='ml-1 text-md font-bold'>
                  {item.FTIME_COMPLETED}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
