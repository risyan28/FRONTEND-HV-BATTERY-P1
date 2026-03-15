'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Activity } from 'lucide-react'
import type { Sequence } from '@/types/sequence'
import { useEffect, useState } from 'react'

interface ProcessingSectionProps {
  data: Sequence | null
}

export function CurrentlySequences({ data }: ProcessingSectionProps) {
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
  if (!data) {
    return (
      <div className='h-[90px] md:h-[150px] bg-card rounded-lg border border-border flex items-center justify-center shadow-sm flex-none'>
        <div className='text-muted-foreground text-sm md:text-2xl flex items-center gap-2 md:gap-3'>
          <Activity className='w-5 h-5 md:w-8 md:h-8' />
          <span className='hidden md:inline'>
            No sequence currently processing
          </span>
          <span className='md:hidden'>No processing</span>
        </div>
      </div>
    )
  }

  const headers = [
    'NO SEQ',
    'TYPE BATTERY',
    'KO SEQ',
    'NO BODY',
    'BARCODE',
    'TIME PRINT',
    'DATA FROM',
  ]
  const mobileHeaders = ['SEQ', 'TYPE', 'KO', 'BODY', 'BARCODE', 'TIME', 'FROM']

  // Lebar kolom dalam persen
  const columnWidths = ['10%', '10%', '10%', '10%', '25%', '25%', '10%']
  const mobileColumnWidths = ['8%', '10%', '8%', '8%', '30%', '28%', '8%']

  return (
    <div className='h-[90px] md:h-[150px] flex flex-col flex-none'>
      {/* Arrow Indicator */}
      <motion.div
        className='flex justify-center'
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className='w-4 h-4 md:w-6 md:h-6 text-yellow-500' />
      </motion.div>

      <motion.div
        className='flex-1 bg-linear-to-r from-yellow-400 to-yellow-500 rounded-lg overflow-hidden shadow-lg border border-border flex flex-col'
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Headers */}
        <div className='flex bg-yellow-500 text-black font-bold'>
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
              className={`p-0.5 md:p-2 text-center border-r border-yellow-600 last:border-r-0 flex items-center justify-center text-xs md:text-xl ${
                header === 'DATA FROM' ? 'md:text-2xl' : ''
              }`}
            >
              <span className='hidden md:inline'>{header}</span>
              <span className='md:hidden text-[9px] leading-tight'>
                {mobileHeaders[index]}
              </span>
            </div>
          ))}
        </div>

        {/* Processing Data */}
        <motion.div
          className='flex flex-1 text-black bg-yellow-400'
          animate={{
            boxShadow: [
              '0 0 0 rgba(234, 179, 8, 0.5)',
              '0 0 25px rgba(234, 179, 8, 0.9)',
              '0 0 0 rgba(234, 179, 8, 0.5)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            style={{
              flexBasis: isMobile ? mobileColumnWidths[0] : columnWidths[0],
              flexGrow: 0,
              flexShrink: 0,
            }}
            className='p-1 md:p-5 text-center flex items-center justify-center font-bold text-xs md:text-2xl border-r border-yellow-500 last:border-r-0'
          >
            {data.FBARCODE?.slice(-7)}
          </div>
          <div
            style={{
              flexBasis: isMobile ? mobileColumnWidths[1] : columnWidths[1],
              flexGrow: 0,
              flexShrink: 0,
            }}
            className='p-1 md:p-5 text-center flex items-center justify-center font-bold text-[10px] md:text-2xl border-r border-yellow-500 last:border-r-0'
          >
            <span className='hidden md:inline'>{data.FMODEL_BATTERY}</span>
            <span className='md:hidden'>
              {data.FMODEL_BATTERY.split('-')[0]}
            </span>
          </div>
          <div
            style={{
              flexBasis: isMobile ? mobileColumnWidths[2] : columnWidths[2],
              flexGrow: 0,
              flexShrink: 0,
            }}
            className='p-1 md:p-5 text-center flex items-center justify-center font-bold text-xs md:text-2xl border-r border-yellow-500 last:border-r-0'
          >
            {data.FSEQ_K0}
          </div>
          <div
            style={{
              flexBasis: isMobile ? mobileColumnWidths[3] : columnWidths[3],
              flexGrow: 0,
              flexShrink: 0,
            }}
            className='p-1 md:p-5 text-center flex items-center justify-center font-bold text-xs md:text-2xl border-r border-yellow-500 last:border-r-0'
          >
            {data.FBODY_NO_K0}
          </div>
          <div
            style={{
              flexBasis: isMobile ? mobileColumnWidths[4] : columnWidths[4],
              flexGrow: 0,
              flexShrink: 0,
            }}
            className='p-1 md:p-5 text-center flex items-center justify-center font-mono text-[10px] md:text-2xl overflow-hidden border-r border-yellow-500 last:border-r-0 font-bold'
          >
            {data.FBARCODE}
          </div>
          <div
            style={{
              flexBasis: isMobile ? mobileColumnWidths[5] : columnWidths[5],
              flexGrow: 0,
              flexShrink: 0,
            }}
            className='p-1 md:p-5 text-center flex items-center justify-center font-mono text-[10px] md:text-2xl overflow-hidden border-r border-yellow-500 last:border-r-0 font-bold'
          >
            {data.FTIME_PRINTED}
          </div>
          <div
            style={{
              flexBasis: isMobile ? mobileColumnWidths[6] : columnWidths[6],
              flexGrow: 0,
              flexShrink: 0,
            }}
            className='p-1 md:p-5 text-center flex items-center justify-center font-mono text-[10px] md:text-xl overflow-hidden border-r border-yellow-500 last:border-r-0 font-bold'
          >
            {data.ORDER_TYPE ?? '-'}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
