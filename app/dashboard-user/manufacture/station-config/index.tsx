'use client'

import { useState, useEffect } from 'react'
import { Settings, Lock, AlertTriangle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { stationConfigApi, type StationConfigItem } from '@/services/stationConfigApi'

export function StationConfig() {
  const [stations, setStations] = useState<StationConfigItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<StationConfigItem | null>(null)

  const sorted = [...stations].sort((a, b) => a.SORT_ORDER - b.SORT_ORDER)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      try {
        const data = await stationConfigApi.getAll()
        setStations(data)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load stations')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const configurable = sorted.filter((s) => s.IS_MANDATORY === 0)
  const station4 = configurable.find((s) => s.STATION_NAME === 'MAN_ASSY_4')
  const station5 = configurable.find((s) => s.STATION_NAME === 'MAN_ASSY_5')

  const requestToggle = (s: StationConfigItem) => setConfirmTarget(s)

  const confirmToggle = async () => {
    if (!confirmTarget) return

    const is4 = confirmTarget.STATION_NAME === 'MAN_ASSY_4'
    const cur4 = station4?.IS_ACTIVE === 1
    const cur5 = station5?.IS_ACTIVE === 1
    const next = confirmTarget.IS_ACTIVE === 1 ? false : true

    let a4: boolean, a5: boolean
    if (is4) {
      a4 = next
      a5 = next ? cur5 : false
    } else {
      a4 = true
      a5 = next
    }

    try {
      const result = await stationConfigApi.updateConfig(a4, a5)
      setStations(result)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setConfirmTarget(null)
    }
  }

  const cancelToggle = () => setConfirmTarget(null)

  const showFullError = error && stations.length === 0

  return (
    <>
      <div className='mb-2 px-4'>
        <div className='mb-1.5 flex items-center gap-1.5'>
          <Settings className='h-5 w-5 text-slate-600' />
          <h2 className='text-base md:text-lg font-bold text-slate-800'>
            Station Configuration
          </h2>
          <span className='text-xs text-slate-400 ml-auto'>
            MANUAL ASSY 1 – 5
          </span>
        </div>

        <div className='rounded-xl bg-white p-3 shadow-sm'>
          {isLoading && stations.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-slate-400' />
            </div>
          ) : showFullError ? (
            <div className='flex items-center justify-center py-8 text-sm text-red-500'>
              <AlertTriangle className='mr-2 h-4 w-4' />
              {error}
            </div>
          ) : (
            <>
              {error && (
                <div className='mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>
                  <AlertTriangle className='h-4 w-4 shrink-0' />
                  {error}
                </div>
              )}

              <div className='grid grid-cols-5 gap-2'>
                {sorted.map((station, i) => {
                  const active = station.IS_ACTIVE === 1 || station.IS_MANDATORY === 1
                  return (
                    <motion.div
                      key={station.FID}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.15 }}
                      className={`flex flex-row items-center gap-3 rounded-lg border-2 px-3 py-3 transition-all ${
                        active
                          ? 'border-green-300 bg-green-50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <img
                        src='/images/cq5dam.web.400.400.webp'
                        alt={station.DISPLAY_NAME}
                        className='h-10 w-10 md:h-14 md:w-14 shrink-0 object-contain'
                      />
                      <div className='flex min-w-0 flex-col gap-1.5'>
                        <span
                          className={`text-xs font-bold leading-tight md:text-base ${
                            active ? 'text-green-800' : 'text-slate-500'
                          }`}
                        >
                          {station.DISPLAY_NAME}
                        </span>

                        {station.IS_MANDATORY === 1 ? (
                          <div className='flex items-center gap-1.5 self-start rounded-full bg-green-200 px-3 py-1'>
                            <Lock className='h-3.5 w-3.5 text-green-700' />
                            <span className='text-[10px] font-bold text-green-800 md:text-xs'>
                              Always Active
                            </span>
                          </div>
                        ) : (
                          <button
                            type='button'
                            onClick={() => {
                              if (!isLoading) requestToggle(station)
                            }}
                            className={`flex items-center gap-1.5 self-start rounded-full border-2 px-3 py-1 text-[10px] font-bold transition-all hover:scale-105 active:scale-95 md:text-xs ${
                              station.IS_ACTIVE === 1
                                ? 'border-green-400 bg-green-100 text-green-800 hover:bg-green-200'
                                : 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                station.IS_ACTIVE === 1 ? 'bg-green-500' : 'bg-slate-400'
                              }`}
                            />
                            {station.IS_ACTIVE === 1 ? 'Active' : 'Not Active'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmTarget !== null && (
          <motion.div
            className='fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl'
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
            >
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-100'>
                  <AlertTriangle className='h-5 w-5 text-amber-600' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-slate-800'>
                    Change Station Status
                  </h3>
                  <p className='text-sm text-slate-500'>
                    {confirmTarget.DISPLAY_NAME}
                  </p>
                </div>
              </div>

              <p className='mb-6 text-sm text-slate-600'>
                {confirmTarget.IS_ACTIVE === 1
                  ? 'Set this station to Not Active?'
                  : 'Set this station to Active?'}
              </p>

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={cancelToggle}
                  disabled={isLoading}
                  className='rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={confirmToggle}
                  disabled={isLoading}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white ${
                    confirmTarget.IS_ACTIVE === 1
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {confirmTarget.IS_ACTIVE === 1 ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
