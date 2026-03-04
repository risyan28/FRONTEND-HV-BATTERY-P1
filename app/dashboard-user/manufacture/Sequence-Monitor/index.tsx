'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/app-header'
import { motion } from 'framer-motion'
import { LoadingScreen } from '@/components/loading-screen'
import { SequenceTable } from '@/components/realtime/sequence-table'
import { CompletedSection } from '@/components/realtime/completed-section'
import { CurrentlySequences } from '@/components/realtime/processing-section'
import { useSequenceSocket } from '@/hooks/use-sequence-socket'
import { RefreshCw, AlertCircle } from 'lucide-react'

export function ProductionSequencePage(): React.ReactElement {
  const { sequences, connected } = useSequenceSocket()

  const [isLoading, setIsLoading] = useState(true)

  // Set loading to false after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // ✅ Error state inline
  if (!connected) {
    return (
      <div className='max-w-2xl mx-auto w-full px-4 py-8'>
        <div className='flex flex-col items-center justify-center min-h-[400px] text-center space-y-4'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Failed to load production data
          </h3>
          <p className='text-gray-600 max-w-md'>Network Error</p>

          <h3 className='flex items-center text-lg font-semibold text-gray-900'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Please Run Backend Service
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-screen flex-col bg-zinc-100 overflow-hidden'>
      {isLoading && <LoadingScreen />}
      {!isLoading && (
        <>
          <div className='flex flex-1 flex-col w-full min-h-0'>
            {/* Header Component */}
            <AppHeader title='SEQUENCE HV BATTERY' />
            <div className='flex-1 flex flex-col p-1 gap-1 min-h-0'>
              {/* Top Section: 80:20 Split - Stack on mobile, side-by-side on desktop */}
              <motion.div
                className='flex flex-col md:flex-row gap-1 flex-1 min-h-0'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SequenceTable data={sequences.queue} />
                <CompletedSection data={sequences.completed} />
              </motion.div>

              {/* Bottom Section: Currently Processing */}
              <motion.div
                className='flex-none'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CurrentlySequences data={sequences.current} />
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
