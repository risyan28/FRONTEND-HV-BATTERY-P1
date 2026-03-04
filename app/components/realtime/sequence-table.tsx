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
  // Desktop widths
  const columnWidths = ['10%', '10%', '10%', '10%', '25%', '25%', '10%']
  // Mobile widths - wider for barcode and time
  const mobileColumnWidths = ['8%', '10%', '8%', '8%', '30%', '28%', '8%']
  const containerRef = useRef<HTMLDivElement>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    <div className='flex-[80] md:flex-[80] rounded-lg border border-border overflow-hidden shadow-sm flex flex-col h-full'>
      <div className='flex flex-col h-full overflow-hidden'>
        {/* Header */}
        <div className='flex text-lg font-bold bg-gray-400 h-7 md:h-12'>
          {headers.map((header, index) => (
            <div
              key={header}
              style={{
                flexBasis: isMobile
                  ? mobileColumnWidths[index]
                  : columnWidths[index],
                flexGrow: 0,
                flexShrink: 0,
              }}
              className={`min-w-0 p-0.5 md:p-2 text-center text-slate-900 last:border-r-0 flex items-center justify-center text-xs md:text-lg ${
                header === 'BARCODE' ||
                header === 'TIME RECEIVED' ||
                header === 'DATA FROM'
                  ? 'md:text-2xl'
                  : ''
              }`}
            >
              <span className='hidden md:inline'>{header}</span>
              <span className='md:hidden text-[9px] leading-tight'>
                {mobileHeaders[index]}
              </span>
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
                        flexBasis: isMobile
                          ? mobileColumnWidths[0]
                          : columnWidths[0],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-0.5 md:p-2 text-center font-bold 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 text-[10px] md:text-lg'
                    >
                      {row.FBARCODE?.slice(-7)}
                    </div>

                    {/* TYPE BATTERY */}
                    <div
                      style={{
                        flexBasis: isMobile
                          ? mobileColumnWidths[1]
                          : columnWidths[1],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-0.5 md:p-2 text-center 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 truncate font-bold text-[9px] md:text-lg'
                    >
                      <span className='hidden md:inline'>
                        {row.FMODEL_BATTERY}
                      </span>
                      <span className='md:hidden'>
                        {row.FMODEL_BATTERY.split('-')[0]}
                      </span>
                    </div>

                    {/* KO SEQ */}
                    <div
                      style={{
                        flexBasis: isMobile
                          ? mobileColumnWidths[2]
                          : columnWidths[2],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-0.5 md:p-2 text-center 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 truncate font-bold text-[9px] md:text-lg'
                    >
                      {row.FSEQ_K0}
                    </div>

                    {/* NO BODY */}
                    <div
                      style={{
                        flexBasis: isMobile
                          ? mobileColumnWidths[3]
                          : columnWidths[3],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-0.5 md:p-2 text-center 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 truncate font-bold text-[9px] md:text-lg'
                    >
                      {row.FBODY_NO_K0}
                    </div>

                    {/* BARCODE */}
                    <div
                      style={{
                        flexBasis: isMobile
                          ? mobileColumnWidths[4]
                          : columnWidths[4],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-0.5 md:p-2 text-center font-mono text-[9px] md:text-xl font-bold 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 
                             overflow-hidden truncate'
                    >
                      {row.FBARCODE}
                    </div>

                    {/* TIME RECEIVED */}
                    <div
                      style={{
                        flexBasis: isMobile
                          ? mobileColumnWidths[5]
                          : columnWidths[5],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-0.5 md:p-2 text-center font-mono font-bold 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                             border-r border-slate-200 dark:border-slate-600 last:border-r-0 
                             overflow-hidden truncate text-[9px] md:text-xl'
                    >
                      {row.FTIME_RECEIVED}
                    </div>

                    {/* DATA FROM */}
                    <div
                      style={{
                        flexBasis: isMobile
                          ? mobileColumnWidths[6]
                          : columnWidths[6],
                        flexGrow: 0,
                        flexShrink: 0,
                      }}
                      className='min-w-0 p-0.5 md:p-2 text-center 
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-[9px] md:text-lg'
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
