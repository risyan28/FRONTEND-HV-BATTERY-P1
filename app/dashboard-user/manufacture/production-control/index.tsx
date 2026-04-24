'use client'

import { AlertCircle, RotateCcw } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PageHeader } from '@/components/production/page-header'
import { useProductionControl } from '@/hooks/use-production-control'
import { PlanSetting } from './plan-setting'
import { SummaryCards } from './summary-cards'
import { HistoryTable } from './history-table'
import { GenerateSequence } from './generate-sequence'

export function ProductionControlPage() {
  const ctrl = useProductionControl()

  // ✅ Error state inline
  if (ctrl.error) {
    return (
      <div className='min-h-screen flex flex-col'>
        <div className='flex-shrink-0 px-2 md:px-6 py-2 md:py-4'>
          <PageHeader isLoading={false} title='Production Control Planning' />
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <div className='flex flex-col items-center gap-2 text-destructive'>
            <AlertCircle className='h-10 w-10 opacity-60' />
            <p className='text-sm font-medium'>{ctrl.error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className='min-h-screen bg-muted/30'>
        {/* Header */}
        <div className='px-2 pb-0 pt-2 md:px-4 md:pt-3'>
          <PageHeader
            isLoading={ctrl.isLoading}
            title='Production Control Planning'
          />
        </div>

        {/* Full content with normal page scroll */}
        <div className='px-2 pb-3 md:px-4'>
          {/* ── Andon Global Settings ────────────────────────────────── */}
          <section className='mb-4 space-y-2'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-start gap-2.5 flex-1'>
                  <div className='mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white shrink-0'>
                    ℹ️
                  </div>
                  <div className='space-y-1'>
                    <p className='font-semibold text-slate-900'>
                      Andon Global Settings
                    </p>
                    <p className='text-sm text-slate-700'>
                      Resets Andon counters + downtime logs (does not affect
                      Plan/Actual data)
                    </p>
                    <p className='text-xs text-slate-600 italic'>
                      💡 Click "Reset All Andon" if counters do not reset
                      automatically at the beginning of shift
                    </p>
                  </div>
                </div>
                <button
                  onClick={ctrl.resetAllAndonGlobal}
                  disabled={ctrl.isResetAllLoading}
                  className='shrink-0 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  <RotateCcw
                    className={`h-4 w-4 ${ctrl.isResetAllLoading ? 'animate-spin' : ''}`}
                  />
                  {ctrl.isResetAllLoading
                    ? 'Resetting...'
                    : 'Reset All Counter Andon'}
                </button>
              </div>
            </div>
          </section>

          {/* ── Step 1: Plan Setting ─────────────────────────────────── */}
          <section className='space-y-2'>
            <div className='flex items-center gap-2 px-1'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shrink-0'>
                1
              </span>
              <span className='text-base font-semibold text-foreground'>
                Set Production Plan
              </span>
              <div className='flex-1 h-px bg-border' />
            </div>
            <div className='grid grid-cols-1 gap-2 lg:grid-cols-2'>
              <PlanSetting
                today={ctrl.today}
                onDateChange={ctrl.setDate}
                isLoading={ctrl.isLoading}
                shift={ctrl.shift}
                onShiftChange={ctrl.setShift}
                cycleTime={ctrl.cycleTime}
                onCycleTimeChange={ctrl.setCycleTime}
                onSaveCycleTime={ctrl.saveCycleTime}
                models={ctrl.models}
                activeModel={ctrl.activeModel}
                newModelName={ctrl.newModelName}
                onModelTabChange={ctrl.setActiveModel}
                onUpdatePlan={ctrl.updatePlan}
                onSave={ctrl.savePlan}
                onReset={ctrl.resetForm}
                planLocked={ctrl.planLocked}
                onEdit={ctrl.editPlan}
                orderTypes={ctrl.allOrderTypes}
                activeOrderTypes={ctrl.activeOrderTypes}
              />
              <SummaryCards
                isLoading={ctrl.isLoading}
                models={ctrl.savedModels}
                actualQtyByKey={ctrl.actualQtyByKey}
              />
            </div>
          </section>

          {/* ── Step 2: Generate Sequence ────────────────────────────── */}
          <section className='mt-3 space-y-2'>
            <div className='flex items-center gap-2 px-1'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shrink-0'>
                2
              </span>
              <span className='text-base font-semibold text-foreground'>
                Generate Sequence
              </span>
              <div className='flex-1 h-px bg-border' />
            </div>
            <GenerateSequence
              today={ctrl.today}
              shift={ctrl.shift}
              planSaved={ctrl.planSaved}
              isLoading={ctrl.isLoading}
              savedModels={ctrl.savedModels}
              generatingItem={ctrl.generatingItem}
              generatedKeys={ctrl.generatedKeys}
              deltaByKey={ctrl.deltaByKey}
              onGenerate={ctrl.handleGenerate}
            />
          </section>

          {/* ── Step 3: History ──────────────────────────────────────── */}
          <section className='mt-3 space-y-2'>
            <div className='flex items-center gap-2 px-1'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shrink-0'>
                3
              </span>
              <span className='text-base font-semibold text-foreground'>
                Plan History
              </span>
              <div className='flex-1 h-px bg-border' />
            </div>
            <div className='min-h-[32rem] overflow-hidden rounded-xl border bg-background shadow-sm'>
              <HistoryTable isLoading={ctrl.isLoading} history={ctrl.history} />
            </div>
          </section>
        </div>
      </div>
    </TooltipProvider>
  )
}
