'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Destination, Sequence } from '@/hooks/use-man-bracket'

interface ProcessingPanelProps {
  currentSeq: Sequence | null
  activeDestination: Destination
  interlockOn: boolean
  inputMode: 'usb' | 'serial'
  scanInputRef: React.RefObject<HTMLInputElement | null>
  displayedBarcode: string
  isSubmitting: boolean
  stdStock?: number
  actBufferStock?: number
  setScanBarcode: (value: string) => void
  handleScanSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleResetProcess: () => Promise<void>
  handleCompleteProcess: () => Promise<void>
}

export function ProcessingPanel({
  currentSeq,
  activeDestination,
  interlockOn,
  inputMode,
  scanInputRef,
  displayedBarcode,
  isSubmitting,
  stdStock = 150,
  actBufferStock = 42,
  setScanBarcode,
  handleScanSubmit,
  handleResetProcess,
  handleCompleteProcess,
}: ProcessingPanelProps): React.ReactElement {
  const currentProcessLabel = currentSeq?.destination ?? activeDestination

  return (
    <motion.div
      className='flex-1 flex flex-col gap-1 min-h-0'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form
        onSubmit={handleScanSubmit}
        className='bg-white rounded-lg shadow border border-slate-200 px-3 sm:px-5 py-2 flex items-center gap-3 flex-shrink-0'
      >
        <label
          htmlFor='scan-barcode'
          className='text-2xl sm:text-3xl font-bold text-slate-700 whitespace-nowrap'
        >
          Scan Barcode
        </label>
        <Input
          id='scan-barcode'
          ref={scanInputRef}
          value={displayedBarcode}
          onChange={(event) => setScanBarcode(event.target.value)}
          placeholder='Scan or type barcode...'
          readOnly={Boolean(currentSeq)}
          disabled={inputMode === 'serial' && !currentSeq}
          autoFocus={inputMode !== 'serial'}
          className='h-16 sm:h-16 !text-3xl sm:!text-3xl md:!text-4xl !font-black !leading-none !bg-white dark:!bg-white !text-black dark:!text-black placeholder:!text-slate-500 read-only:cursor-not-allowed read-only:opacity-80 disabled:cursor-not-allowed disabled:opacity-50'
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            WebkitTextFillColor: '#000000',
          }}
        />
        <Button
          type='button'
          onClick={handleResetProcess}
          className='h-14 sm:h-16 px-6 sm:px-8 text-xl sm:text-2xl font-bold bg-slate-200 text-slate-900 hover:bg-slate-300'
        >
          Reset
        </Button>
        <Button
          type='submit'
          disabled={isSubmitting}
          className='h-14 sm:h-16 px-6 sm:px-8 text-xl sm:text-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-500 disabled:text-slate-200 disabled:cursor-not-allowed'
        >
          Enter
        </Button>
      </form>

      <div className='flex-1 bg-white rounded-lg shadow border border-slate-200 flex flex-col overflow-hidden'>
        <div className='flex items-center justify-between px-3 py-2 flex-shrink-0'>
          <h2 className='text-lg sm:text-2xl font-bold text-slate-700'>
            Processing Now
          </h2>
          <div className='flex items-center gap-2'>
            <span
              className={`flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-lg ${
                inputMode === 'serial'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-slate-200 text-slate-600 border border-slate-300'
              }`}
            >
              {inputMode === 'serial' && (
                <span className='w-2 h-2 rounded-full bg-blue-500 animate-pulse' />
              )}
              Scan Mode: {inputMode === 'serial' ? 'SERIAL' : 'USB'}
            </span>
            {interlockOn ? (
              <span className='flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-lg bg-green-100 text-green-700 border border-green-400'>
                <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                INTERLOCK ON
              </span>
            ) : (
              <>
                <span
                  className={`font-black text-base px-3 py-1 rounded-lg text-white ${
                    activeDestination === 'ASSY'
                      ? 'bg-blue-600'
                      : 'bg-amber-500'
                  }`}
                >
                  {activeDestination}
                </span>
                <span className='flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-lg bg-red-100 text-red-700 border border-red-300'>
                  <span className='w-2 h-2 rounded-full bg-red-500 animate-pulse' />
                  INTERLOCK OFF
                </span>
              </>
            )}
          </div>
        </div>

        <div className='flex-1 flex gap-2 min-h-0 mx-3 my-3'>
          <div className='flex-1 relative flex justify-center bg-yellow-400 items-center rounded-md text-center px-4 py-2'>
            {currentSeq ? (
              <div className='text-center w-full max-w-6xl'>
                {currentSeq.orderType === 'SERVICE PART' ? (
                  <div
                    className='font-black text-black tracking-widest leading-none flex flex-col items-center'
                    style={{ fontSize: 'clamp(3rem, 14vw, 16rem)' }}
                  >
                    <span>SERVICE</span>
                    <span>PART</span>
                  </div>
                ) : (
                  <div
                    className='font-black text-black tracking-widest'
                    style={{
                      fontSize: 'clamp(8rem, 25vw, 25rem)',
                      lineHeight: 1,
                    }}
                  >
                    {currentProcessLabel}
                  </div>
                )}
              </div>
            ) : (
              <div className='bg-slate-50 rounded-xl p-4 sm:p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 h-full flex flex-col justify-center w-full'>
                <AlertCircle className='w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-slate-300' />
                <div className='text-lg sm:text-xl font-medium mb-2'>
                  No Active Man Bracket Process
                </div>
                <div className='text-sm sm:text-base'>
                  Scan a Barcode to Begin Processing
                </div>
              </div>
            )}
          </div>

          {/* Stock Info Sidebar */}
          <div className='w-56 sm:w-68 flex-shrink-0 bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden shadow-sm'>
            <div className='bg-slate-800 text-white px-3 py-2 flex items-center justify-center h-12 flex-shrink-0'>
              <span className='text-base sm:text-xl font-bold tracking-wider'>
                BATTERY STOCK - ASSY
              </span>
            </div>

            <div className='flex-1 flex flex-col justify-center gap-4 p-3 min-h-0'>
              <div className='flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-center flex flex-col justify-center'>
                <div className='text-base sm:text-2xl font-bold text-slate-600 tracking-wide mb-2'>
                  STD STOCK
                </div>
                <div className='text-5xl sm:text-6xl lg:text-8xl font-black leading-none text-slate-900'>
                  {stdStock}
                </div>
              </div>

              <div className='flex-1 bg-blue-50 border border-blue-200 p-4 rounded-xl text-center flex flex-col justify-center'>
                <div className='text-base sm:text-2xl font-bold text-blue-700 tracking-wide mb-2'>
                  BUFFER STOCK
                </div>
                <div className='text-5xl sm:text-7xl lg:text-8xl font-black leading-none text-blue-700'>
                  {actBufferStock}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-shrink-0 border-t border-slate-300 bg-slate-100 px-3 sm:px-4 py-3'>
          <Button
            onClick={handleCompleteProcess}
            disabled={isSubmitting || !currentSeq}
            className='w-full min-h-16 sm:min-h-20 py-4 sm:py-5 text-4xl sm:text-6xl font-bold bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all'
          >
            <CheckCheck className='w-20 h-20 sm:w-20 sm:h-20' />
            {isSubmitting ? 'Saving...' : 'PROCESS COMPLETE'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
