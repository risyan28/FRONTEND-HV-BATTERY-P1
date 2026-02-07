'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Clock } from '@/components/andon-screen/clock'
import { FactoryLayout } from '@/components/andon-screen/factory-layout'
import { DowntimePanel } from '@/components/andon-screen/downtime-panel'
import { InfoGrid } from '@/components/andon-screen/info-grid'
import { SummaryBar } from '@/components/andon-screen/summary-bar'
import { LoadingScreen } from '@/components/loading-screen'
import { useSocketStatus } from '@/hooks/use-socket-status'
import { useSummaryListener } from '@/hooks/use-summary-socket'
import { useFactoryData } from '@/hooks/use-factory-data'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { useDowntimeListener } from '@/hooks/use-downtime-socket'

export function AndonScreen() {
  const { connected } = useSocketStatus()
  const { dataSummary } = useSummaryListener()
  const { activeCalls, processStatuses } = useFactoryData()
  const [isLoading, setIsLoading] = useState(true)
  const { downtimeData } = useDowntimeListener()

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
    <div className='flex min-h-screen flex-col bg-zinc-100'>
      {isLoading && <LoadingScreen />}
      {!isLoading && (
        <>
          {/* Top Section */}
          <div className='flex-1 flex flex-col p-1'>
            <motion.div
              className='flex gap-2'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* LEFT - TITLE */}
              <div className='flex-8 flex items-center justify-center border-4 border-black bg-white rounded-md p-3'>
                <h1 className='text-[7vw] md:text-[9vw] xl:text-[4vw] font-extrabold uppercase text-center tracking-tight'>
                  HEV BATTERY LINE
                </h1>
              </div>

              {/* RIGHT - CLOCK */}
              <div className='flex-2 flex flex-col items-center justify-center border-4 border-black bg-white rounded-md p-3'>
                <Clock className='w-full text-right px-2' />
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className='flex-1 flex flex-col p-2'>
            <motion.div
              className='flex gap-2' // 👈 tambah gap horizontal
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* LEFT - Factory Layout */}
              <div className='flex-4  rounded-md -mt-12'>
                <FactoryLayout
                  act_assy={dataSummary.ActAssy}
                  act_ckd={dataSummary.ActCkd}
                  activeCalls={activeCalls}
                  processStatuses={processStatuses}
                />
              </div>

              {/* RIGHT - Downtime Panel + InfoGrid */}
              <div className='flex-6 rounded-md'>
                <DowntimePanel downtimeData={downtimeData} />
                <InfoGrid className='mt-2' activeCalls={activeCalls} />
              </div>
            </motion.div>
          </div>

          <footer className='p-2'>
            <SummaryBar
              target={dataSummary.Target}
              plan={dataSummary.Plan}
              actual={dataSummary.ActCkd + dataSummary.ActAssy}
              effPct={dataSummary.Eff}
            />
          </footer>
        </>
      )}
    </div>
  )
}
