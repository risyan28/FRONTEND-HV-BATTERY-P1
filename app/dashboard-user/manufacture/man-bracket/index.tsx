'use client'

import React from 'react'
import { CheckCircle2, Settings } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { LoadingScreen } from '@/components/loading-screen'
import { useManBracket, type OrderType } from '@/hooks/use-man-bracket'
import { ORDER_TYPES } from './constants'
import { SettingsPanel } from './settings-panel'
import { ProcessingPanel } from './processing-panel'
import { CompletedPanel } from './completed-panel'

export function ManBracketPage(): React.ReactElement {
  const {
    completedSeqs,
    isLoading,
    isSubmitting,
    showCompletePopup,
    scanBarcode,
    interlockOn,
    manualDestination,
    showSettings,
    scanInputRef,
    completedListRef,
    currentSeq,
    activeDestination,

    setScanBarcode,
    setShowSettings,

    handleToggleInterlock,
    handleSetManualDestination,
    handleScanSubmit,
    handleResetProcess,
    handleCompleteProcess,
  } = useManBracket()

  const displayedBarcode = currentSeq?.barcode ?? scanBarcode

  const completedByType = ORDER_TYPES.reduce(
    (acc, type) => {
      acc[type] = completedSeqs.filter(
        (sequence) => sequence.orderType === type,
      ).length
      return acc
    },
    {} as Record<OrderType, number>,
  )

  return (
    <div className='flex h-screen flex-col bg-zinc-100 overflow-hidden'>
      {showCompletePopup && (
        <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4'>
          <div className='w-full max-w-4xl rounded-3xl border-2 border-emerald-300 bg-white px-10 py-12 md:px-14 md:py-14 shadow-2xl text-center'>
            <CheckCircle2 className='mx-auto mb-4 h-28 w-28 md:h-32 md:w-32 text-emerald-600' />
            <h2 className='text-5xl md:text-6xl font-black tracking-wide text-emerald-700'>
              PROCESS COMPLETE
            </h2>
            <p className='mt-3 text-2xl md:text-3xl font-semibold text-slate-600'>
              Returning to initial cycle...
            </p>
          </div>
        </div>
      )}

      <SettingsPanel
        showSettings={showSettings}
        interlockOn={interlockOn}
        manualDestination={manualDestination}
        scanInputRef={scanInputRef}
        setShowSettings={setShowSettings}
        handleToggleInterlock={handleToggleInterlock}
        handleSetManualDestination={handleSetManualDestination}
      />

      {isLoading && <LoadingScreen />}
      {!isLoading && (
        <div className='flex flex-1 flex-col w-full min-h-0'>
          <AppHeader
            title='MAN BRACKET - HEV BATTERY'
            className='h-16 md:h-16'
          />

          <div className='flex flex-1 min-h-0 overflow-hidden p-1 gap-1'>
            <ProcessingPanel
              currentSeq={currentSeq}
              activeDestination={activeDestination}
              interlockOn={interlockOn}
              scanInputRef={scanInputRef}
              displayedBarcode={displayedBarcode}
              isSubmitting={isSubmitting}
              setScanBarcode={setScanBarcode}
              handleScanSubmit={handleScanSubmit}
              handleResetProcess={handleResetProcess}
              handleCompleteProcess={handleCompleteProcess}
            />

            <button
              onClick={() => setShowSettings(true)}
              className='fixed left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-12 rounded-r-xl bg-white border-2 border-l-0 border-slate-300 shadow-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg transition-all'
              title='Settings'
            >
              <Settings className='w-8 h-8' />
            </button>

            <CompletedPanel
              completedSeqs={completedSeqs}
              completedByType={completedByType}
              completedListRef={completedListRef}
            />
          </div>
        </div>
      )}
    </div>
  )
}
