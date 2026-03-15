'use client'

import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Save, Calendar, Pencil, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ORDER_TYPE_COLORS } from './constants'
import type { OrderType, Shift, ModelPlan } from '@/types/prod-control'

interface PlanSettingProps {
  today: string
  onDateChange: (v: string) => void
  isLoading: boolean
  shift: Shift
  models: ModelPlan[]
  activeModel: string
  newModelName: string
  onShiftChange: (v: Shift) => void
  onModelTabChange: (id: string) => void
  onUpdatePlan: (modelId: string, ot: OrderType, value: number) => void
  onSave: () => void
  onReset: () => void
  planLocked: boolean
  onEdit: () => void
  orderTypes: string[]
  activeOrderTypes: string[]
}

export function PlanSetting({
  today,
  onDateChange,
  isLoading,
  shift,
  models,
  activeModel,
  newModelName,
  onShiftChange,
  onModelTabChange,
  onUpdatePlan,
  onSave,
  onReset,
  planLocked,
  onEdit,
  orderTypes,
  activeOrderTypes,
}: PlanSettingProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const activeM = models.find((m) => m.id === activeModel) ?? models[0]

  const OT_NOTES: Record<string, string> = {
    Assy: 'Qty is auto-derived from actual ALC data. Manual input not required.',
    'Service Part':
      'Reserved for future use. Not applicable for current production cycle.',
  }

  return (
    <Card className='rounded-xl border shadow-sm'>
      {/* ── Header: Date + Shift ─────────────────────────────────── */}
      <CardHeader className='rounded-t-xl border-b bg-muted/40 px-3 py-2.5'>
        <div className='flex items-center justify-between gap-4'>
          {/* Production Date */}
          <div className='flex items-center gap-2'>
            {isLoading ? (
              <Skeleton className='h-7 w-44' />
            ) : (
              <div className='flex items-center gap-2'>
                <Label className='text-base font-medium text-muted-foreground'>
                  Production Date
                </Label>
                <div className='relative'>
                  <input
                    ref={dateInputRef}
                    type='date'
                    value={today}
                    onChange={(e) => onDateChange(e.target.value)}
                    onClick={(e) => {
                      const t = e.target as HTMLInputElement
                      t.showPicker?.()
                    }}
                    className='cursor-pointer rounded-lg border-2 border-gray-300 bg-white py-1.5 pl-3 pr-10 text-base font-medium transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <Calendar
                    className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer z-10'
                    aria-hidden='true'
                    onClick={() => dateInputRef.current?.showPicker()}
                  />
                </div>
              </div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Label className='text-base font-medium text-muted-foreground'>
              Shift
            </Label>
            {isLoading ? (
              <Skeleton className='h-7 w-24' />
            ) : (
              <Select
                value={shift}
                onValueChange={(v) => onShiftChange(v as Shift)}
              >
                <SelectTrigger className='h-9 w-28 text-base'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='DAY' className='text-base'>
                    DAY
                  </SelectItem>
                  <SelectItem value='NIGHT' className='text-base'>
                    NIGHT
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='px-3 pt-2.5 pb-3'>
        {isLoading ? (
          <div className='space-y-2'>
            <div className='flex gap-2'>
              <Skeleton className='h-6 w-20 rounded-full' />
            </div>
            <div className='grid grid-cols-3 gap-2'>
              <Skeleton className='h-28 rounded-xl' />
              <Skeleton className='h-28 rounded-xl' />
              <Skeleton className='h-28 rounded-xl' />
            </div>
          </div>
        ) : (
          <>
            {/* ── Model selector dropdown ──────────────────────── */}
            <div className='mb-2.5 flex items-center gap-2'>
              <span className='shrink-0 text-base font-medium text-muted-foreground'>
                Model
              </span>
              {planLocked ? (
                <span className='rounded bg-muted px-2 py-1 text-base font-semibold border'>
                  {models.find((m) => m.id === activeModel)?.name ??
                    activeModel}
                </span>
              ) : (
                <Select value={activeModel} onValueChange={onModelTabChange}>
                  <SelectTrigger className='h-9 w-44 text-base'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.id} className='text-base'>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* ── 3-column Order Type tiles ───────────────────── */}
            <AnimatePresence mode='wait'>
              {activeM && (
                <motion.div
                  key={activeM.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className='mb-1 grid grid-cols-3 gap-2'>
                    {orderTypes.map((ot) => {
                      const isOtActive = activeOrderTypes.includes(ot)
                      const isInteractive = isOtActive && !planLocked
                      const note = OT_NOTES[ot]
                      return (
                        <div key={ot} className='mb-1.5 flex flex-col gap-1'>
                          {/* ── tile box ── */}
                          <div
                            className={cn(
                              'flex flex-col gap-1 rounded-xl border-2 bg-card px-2 py-2 transition-all',
                              isInteractive
                                ? 'border-dashed hover:border-solid hover:shadow-sm'
                                : 'border-transparent bg-muted/30 cursor-default',
                            )}
                          >
                            <Badge
                              variant='outline'
                              className={cn(
                                'w-fit px-1.5 py-0 text-sm font-semibold',
                                ORDER_TYPE_COLORS[ot as OrderType],
                              )}
                            >
                              {ot}
                            </Badge>
                            {isOtActive ? (
                              <input
                                type='number'
                                min={0}
                                value={activeM.plans[ot as OrderType]}
                                readOnly={planLocked}
                                onChange={(e) =>
                                  isInteractive &&
                                  onUpdatePlan(
                                    activeM.id,
                                    ot as OrderType,
                                    Number(e.target.value),
                                  )
                                }
                                className={cn(
                                  'h-9 w-full border-0 bg-transparent text-center text-2xl font-black text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                                  planLocked && 'cursor-default select-none',
                                )}
                              />
                            ) : (
                              <div className='flex h-9 w-full select-none items-center justify-center text-2xl font-black text-muted-foreground/30'>
                                —
                              </div>
                            )}
                            {!note && (
                              <span className='text-center text-sm leading-none text-muted-foreground'>
                                Target (QTY)
                              </span>
                            )}
                          </div>
                          {/* ── note outside box ── */}
                          {note && (
                            <p className='px-1 text-center text-sm leading-tight text-red-500'>
                              {note}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <Separator className='my-2.5' />

        <div className='flex items-center gap-2 justify-end'>
          {planLocked ? (
            <>
              <span className='mr-auto flex items-center gap-1.5 text-base font-medium text-green-600'>
                <Lock className='h-3.5 w-3.5' />
                Plan locked
              </span>
              <Button
                size='sm'
                variant='outline'
                onClick={onEdit}
                className='h-8 text-base'
              >
                <Pencil className='h-4 w-4 mr-1.5' />
                Edit Plan
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='ghost'
                size='sm'
                onClick={onReset}
                className='h-8 text-base'
              >
                <RotateCcw className='h-4 w-4 mr-1.5' />
                Reset
              </Button>
              <Button
                size='sm'
                onClick={onSave}
                disabled={isLoading}
                className='h-8 text-base'
              >
                <Save className='h-4 w-4 mr-1.5' />
                Save Plan
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
