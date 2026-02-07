import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Sequence } from '@/types/sequence'

interface SequenceTableProps {
  data: Sequence[]
}

export function SequenceTable({ data }: SequenceTableProps) {
  const headers = [
    'NO SEQ',
    'TYPE BATTERY',
    'KO SEQ',
    'NO BODY',
    'BARCODE',
    'TIME RECEIVED',
    'DATA FROM',
  ]
  const mobileHeaders = ['SEQ', 'TYPE', 'KO', 'BODY', 'BARCODE', 'TIME', 'FROM']
  const columnWidths = ['10%', '10%', '10%', '10%', '25%', '25%', '10%']
  const containerRef = useRef<HTMLDivElement>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // bikin data terurut sebelum di-map
  const sortedData = [...data].sort((a, b) => {
    const timeA = a.FID_ADJUST
    const timeB = b.FID_ADJUST
    return sortOrder === 'desc' ? timeA - timeB : timeB - timeA
  })

  // Auto-scroll ke bawah saat data update
  useEffect(() => {
    if (containerRef.current) {
      // scroll ke paling bawah hanya sekali (saat mount)
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, []) // kosong → cuma sekali

  return (
    <div className='flex-8 rounded-lg border border-border overflow-hidden shadow-sm h-[calc(100vh-300px)]'>
      <div className='h-full flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='flex text-lg font-bold bg-gray-400 h-16'>
          {headers.map((header, index) => (
            <div
              key={header}
              style={{
                flexBasis: columnWidths[index],
                flexGrow: 0,
                flexShrink: 0,
              }}
              className={`min-w-0 p-2 text-center text-slate-900 last:border-r-0 ${
                header === 'BARCODE' || header === 'TIME RECEIVED'
                  ? 'text-xl'
                  : 'text-lg'
              }`}
            >
              <span className='hidden sm:inline'>{header}</span>
              <span className='sm:hidden'>{mobileHeaders[index]}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div
          ref={containerRef}
          className='flex-1 bg-white dark:bg-slate-800 overflow-y-auto overflow-x-hidden w-full flex flex-col-reverse'
        >
          <div className=''>
            <AnimatePresence mode='popLayout'>
              {[...sortedData]
                .reverse() // render dibalik → newest di bawah
                .map((row, index) => (
                  <motion.div
                    key={row.FID}
                    className='flex border-b border-slate-200 dark:border-slate-600 
                           hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors overflow-hidden'
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      type: 'spring',
                      stiffness: 100,
                    }}
                    layout
                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  >
                    {/* NO SEQ */}
                    <div
                      style={{
                        flexBasis: columnWidths[0],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-2 text-center font-bold 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 text-lg'
                    >
                      {row.FBARCODE?.slice(-7)}
                    </div>

                    {/* TYPE BATTERY */}
                    <div
                      style={{
                        flexBasis: columnWidths[1],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-2 text-center 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 truncate font-bold text-lg'
                    >
                      <span className='hidden sm:inline'>
                        {row.FMODEL_BATTERY}
                      </span>
                      <span className='sm:hidden'>
                        {row.FMODEL_BATTERY.split('-')[0]}
                      </span>
                    </div>

                    {/* KO SEQ */}
                    <div
                      style={{
                        flexBasis: columnWidths[2],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-2 text-center 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 truncate font-bold text-lg'
                    >
                      {row.FSEQ_K0}
                    </div>

                    {/* NO BODY */}
                    <div
                      style={{
                        flexBasis: columnWidths[3],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-2 text-center 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 truncate font-bold text-lg'
                    >
                      {row.FBODY_NO_K0}
                    </div>

                    {/* BARCODE */}
                    <div
                      style={{
                        flexBasis: columnWidths[4],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-2 text-center font-mono text-xl font-bold 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 
                             overflow-hidden truncate'
                    >
                      {row.FBARCODE}
                    </div>

                    {/* TIME RECEIVED */}
                    <div
                      style={{
                        flexBasis: columnWidths[5],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-2 text-center font-mono font-bold 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 
                             overflow-hidden truncate text-xl'
                    >
                      {row.FTIME_RECEIVED}
                    </div>

                    {/* DATA FROM */}
                    <div
                      style={{
                        flexBasis: columnWidths[6],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-2 text-center 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-md'
                    >
                      {row.FALC_DATA}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
