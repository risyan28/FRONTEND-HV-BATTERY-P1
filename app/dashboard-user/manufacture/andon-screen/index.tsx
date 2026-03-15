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
  const [isDesktopLike, setIsDesktopLike] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  // Set loading to false after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Read orientation mode from URL query param only (no auto-detect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const modeParam = params.get('mode')

    if (modeParam === 'landscape') {
      setIsLandscape(true)
    } else {
      // Default: portrait
      setIsLandscape(false)
    }
  }, [])

  // Treat non-touch / fine-pointer devices as desktop-like so small portrait PCs
  // still render the desktop layout instead of the mobile layout.
  useEffect(() => {
    const checkDevice = () => {
      const hasTouch =
        typeof navigator !== 'undefined' &&
        (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)
      const pointerFine =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(pointer: fine)').matches
      setIsDesktopLike(!hasTouch || pointerFine)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
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
    <div className='flex h-screen flex-col bg-zinc-100'>
      {isLoading && <LoadingScreen />}
      {!isLoading && (
        <div
          className={`flex-1 min-h-0 ${isLandscape ? 'overflow-hidden' : 'overflow-auto'}`}
        >
          {isLandscape ? (
            // ============ LANDSCAPE LAYOUT ============
            <div className='flex flex-col h-full'>
              {/* Top Section - Title + Clock */}
              <div className='flex-none p-1 h-28'>
                <motion.div
                  className='flex gap-2 flex-row h-full'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className='flex-[8] h-full flex items-center justify-center border-4 border-black bg-white rounded-md py-1 px-2'>
                    <h1 className='text-8xl font-extrabold uppercase text-center tracking-tight'>
                      HEV BATTERY LINE
                    </h1>
                  </div>
                  <div className='flex-[2] h-full flex flex-col items-center justify-center border-4 border-black bg-white rounded-md py-1 px-2'>
                    <Clock className='w-full' fontSize='text-[38px]' />
                  </div>
                </motion.div>
              </div>

              {/* Middle Section - Factory Layout (Left) + Downtime & Info (Right) */}
              <div className='flex-1 flex flex-row p-1 gap-2 min-h-0'>
                <motion.div
                  className='flex-[7] rounded-md'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <FactoryLayout
                    act_assy={dataSummary.ActAssy}
                    act_ckd={dataSummary.ActCkd}
                    activeCalls={activeCalls}
                    processStatuses={processStatuses}
                    isLandscape={true}
                  />

                  <footer className='p-1 flex-none mt-12'>
                    <SummaryBar
                      target={dataSummary.Target}
                      plan={dataSummary.Plan}
                      actual={dataSummary.ActCkd + dataSummary.ActAssy}
                      effPct={dataSummary.Eff}
                      isLandscape={true}
                    />
                  </footer>
                </motion.div>

                <motion.div
                  className='flex-[3] flex flex-col gap-2 min-h-0 overflow-hidden'
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className='flex-1 min-h-0'>
                    <DowntimePanel
                      downtimeData={downtimeData}
                      isLandscape={true}
                    />
                  </div>
                  <div className='flex-1 min-h-0'>
                    <InfoGrid activeCalls={activeCalls} isLandscape={true} />
                  </div>
                </motion.div>
              </div>

              {/* Bottom Section - Summary Bar */}
            </div>
          ) : (
            // ============ PORTRAIT LAYOUT ============
            <>
              {/* Top Section */}
              <div className='flex-none flex flex-col p-1 md:p-2'>
                <motion.div
                  className={`flex gap-2 ${isDesktopLike ? 'flex-row' : 'flex-col'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* LEFT - TITLE */}
                  <div className='flex-8 flex items-center justify-center border-4 border-black bg-white rounded-md p-2 md:p-3'>
                    <h1
                      className={`${isDesktopLike ? 'text-[7vw] md:text-[9vw] xl:text-[4vw]' : 'text-[6vw]'} font-extrabold uppercase text-center tracking-tight`}
                    >
                      HEV BATTERY LINE
                    </h1>
                  </div>

                  {/* RIGHT - CLOCK */}
                  <div className='flex-2 flex flex-col items-center justify-center border-4 border-black bg-white rounded-md p-2 md:p-3'>
                    <Clock className='w-full text-right px-2' />
                  </div>
                </motion.div>
              </div>

              {/* Bottom Section */}
              <div className='flex-1 flex flex-col p-1 md:p-2 pb-2 md:pb-2'>
                <motion.div
                  className={`flex gap-2 ${isDesktopLike ? 'flex-row' : 'flex-col'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {/* LEFT - Factory Layout */}
                  <div className='flex-[5] rounded-md -mt-4 md:-mt-12'>
                    <FactoryLayout
                      act_assy={dataSummary.ActAssy}
                      act_ckd={dataSummary.ActCkd}
                      activeCalls={activeCalls}
                      processStatuses={processStatuses}
                      isLandscape={false}
                    />
                  </div>

                  {/* RIGHT - Downtime Panel + InfoGrid */}
                  <div className='flex-[5] rounded-md'>
                    <DowntimePanel downtimeData={downtimeData} />
                    <InfoGrid className='mt-2' activeCalls={activeCalls} />
                  </div>
                </motion.div>
              </div>

              <footer className='p-1 md:p-2 pb-2 md:pb-2 flex-none mt-12 md:-mt-4'>
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
      )}
    </div>
  )
}
