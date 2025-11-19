'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Activity } from 'lucide-react'
import type { Sequence } from '@/types/sequence'

interface ProcessingSectionProps {
  data: Sequence | null
}

export function CurrentlySequences({ data }: ProcessingSectionProps) {
  if (!data) {
    return (
      <div className='h-[200px] bg-card rounded-lg border border-border flex items-center justify-center shadow-sm mt-2'>
        <div className='text-muted-foreground text-2xl flex items-center gap-3'>
          <Activity className='w-8 h-8' />
          <span className='hidden sm:inline'>
            No sequence currently processing
          </span>
          <span className='sm:hidden'>No processing</span>
        </div>
      </div>
    )
  }

  const headers = [
    'NO SEQUENCE',
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

  return (
    <div className='h-full flex flex-col'>
      {/* Arrow Indicator */}
      <motion.div
        className='flex justify-center mb-3'
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className='w-10 h-10 text-yellow-500' />
      </motion.div>

      <motion.div
        className='flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg overflow-hidden shadow-lg border border-border flex flex-col'
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Headers */}
        <div className='flex bg-yellow-500 text-black font-bold text-xl'>
          {headers.map((header, index) => (
            <div
              key={header}
              style={{
                flexBasis: columnWidths[index],
                flexGrow: 0,
                flexShrink: 0,
              }}
              className='p-4 text-center border-r border-yellow-600 last:border-r-0'
            >
              <span className='hidden sm:inline'>{header}</span>
              <span className='sm:hidden'>{mobileHeaders[index]}</span>
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
            style={{ flexBasis: columnWidths[0], flexGrow: 0, flexShrink: 0 }}
            className='p-5 text-center flex items-center justify-center font-bold text-3xl border-r border-yellow-500 last:border-r-0'
          >
            {data.FBARCODE?.slice(-7)}
          </div>
          <div
            style={{ flexBasis: columnWidths[1], flexGrow: 0, flexShrink: 0 }}
            className='p-5 text-center flex items-center justify-center font-bold text-3xl border-r border-yellow-500 last:border-r-0'
          >
            <span className='hidden sm:inline'>{data.FMODEL_BATTERY}</span>
          </div>
          <div
            style={{ flexBasis: columnWidths[2], flexGrow: 0, flexShrink: 0 }}
            className='p-5 text-center flex items-center justify-center font-bold text-3xl border-r border-yellow-500 last:border-r-0'
          >
            {data.FSEQ_K0}
          </div>
          <div
            style={{ flexBasis: columnWidths[3], flexGrow: 0, flexShrink: 0 }}
            className='p-5 text-center flex items-center justify-center font-bold text-3xl border-r border-yellow-500 last:border-r-0'
          >
            {data.FBODY_NO_K0}
          </div>
          <div
            style={{ flexBasis: columnWidths[4], flexGrow: 0, flexShrink: 0 }}
            className='p-5 text-center flex items-center justify-center font-mono text-3xl overflow-hidden border-r border-yellow-500 last:border-r-0 font-bold'
          >
            <span className='hidden lg:inline'>{data.FBARCODE}</span>
          </div>
          <div
            style={{ flexBasis: columnWidths[5], flexGrow: 0, flexShrink: 0 }}
            className='p-5 text-center flex items-center justify-center font-mono text-3xl overflow-hidden border-r border-yellow-500 last:border-r-0 font-bold'
          >
            <span className='hidden md:inline'>{data.FTIME_PRINTED}</span>
          </div>
          <div
            style={{ flexBasis: columnWidths[6], flexGrow: 0, flexShrink: 0 }}
            className='p-5 text-center flex items-center justify-center font-mono text-xl overflow-hidden border-r border-yellow-500 last:border-r-0 font-bold'
          >
            {data.FALC_DATA}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
