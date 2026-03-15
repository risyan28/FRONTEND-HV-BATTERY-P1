'use client'

import { AlertCircle } from 'lucide-react'
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
                models={ctrl.models}
                activeModel={ctrl.activeModel}
                newModelName={ctrl.newModelName}
                onShiftChange={ctrl.setShift}
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
