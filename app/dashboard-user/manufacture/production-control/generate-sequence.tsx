'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, CheckCircle2, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ORDER_TYPES, ORDER_TYPE_COLORS } from './constants'
import type { ModelPlan, OrderType, Shift } from '@/types/prod-control'

const formatDateDisplay = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

interface GenerateItem {
  modelId: string
  modelName: string
  orderType: OrderType
  qty: number
}

interface GenerateSequenceProps {
  today: string
  shift: Shift
  planSaved: boolean
  isLoading: boolean
  savedModels: ModelPlan[]
  generatingItem: string | null
  generatedKeys: Set<string>
  deltaByKey: Record<string, number>
  onGenerate: (modelId: string, modelName: string, ot: OrderType) => void
}

export function GenerateSequence({
  today,
  shift,
  planSaved,
  isLoading,
  savedModels,
  generatingItem,
  generatedKeys,
  deltaByKey,
  onGenerate,
}: GenerateSequenceProps) {
  const [dialogTarget, setDialogTarget] = useState<GenerateItem | null>(null)

  const items: GenerateItem[] = savedModels.flatMap((m) =>
    ORDER_TYPES.filter((ot) => {
      const k = `${m.name}-${ot}`
      return m.plans[ot] > 0 || Math.abs(deltaByKey[k] ?? 0) > 0
    }).map((ot) => ({
      modelId: m.id,
      modelName: m.name,
      orderType: ot,
      qty: m.plans[ot],
    })),
  )

  if (isLoading) {
    return (
      <Card className='rounded-xl border shadow-sm'>
        <CardHeader className='px-4 pt-3 pb-3 border-b bg-muted/40 rounded-t-xl'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-5 w-24' />
          </div>
        </CardHeader>
        <CardContent className='px-4 pt-3 pb-4 space-y-2'>
          <Skeleton className='h-11 rounded-xl' />
          <Skeleton className='h-11 rounded-xl' />
          <Skeleton className='h-11 rounded-xl' />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className='rounded-xl border shadow-sm'>
        {/* ── Header ───────────────────────────────────────────── */}
        <CardHeader className='rounded-t-xl border-b bg-muted/40 px-3 py-2.5'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-base font-bold leading-tight'>
                Generate Sequence
              </p>
              <p className='mt-0.5 text-sm text-muted-foreground'>
                {formatDateDisplay(today)} &middot; {shift} shift
              </p>
            </div>
            {planSaved ? (
              <Badge
                variant='outline'
                className='flex shrink-0 items-center gap-1 border-green-200 bg-green-50 text-sm text-green-600'
              >
                <CheckCircle2 className='h-3 w-3' />
                Plan saved
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='shrink-0 border-amber-200 bg-amber-50 text-sm text-amber-600'
              >
                Not saved yet
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* ── Content ──────────────────────────────────────────── */}
        <CardContent className='px-3 pt-2.5 pb-3'>
          {!planSaved ? (
            <div className='flex flex-col items-center justify-center gap-2 py-5 text-muted-foreground'>
              <ClipboardList className='h-8 w-8 opacity-30' />
              <p className='text-base font-medium'>Save your plan first</p>
              <p className='text-sm opacity-70'>
                Complete step 1 to enable sequence generation.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-5 text-muted-foreground'>
              <ClipboardList className='h-8 w-8 opacity-30' />
              <p className='text-base'>No items with qty &gt; 0.</p>
            </div>
          ) : (
            <div className='space-y-1.5'>
              <AnimatePresence initial={false}>
                {items.map((item, i) => {
                  const itemKey = `${item.modelId}-${item.orderType}`
                  const generatedKey = `${item.modelName}-${item.orderType}`
                  const delta = deltaByKey[generatedKey] ?? item.qty
                  const hasDelta = delta !== 0
                  const isGenerated =
                    generatedKeys.has(generatedKey) && !hasDelta
                  const isGenerating = generatingItem === itemKey
                  const isBusy = !!generatingItem

                  return (
                    <motion.div
                      key={itemKey}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-colors',
                        isGenerated
                          ? 'bg-green-50/60 border-green-100'
                          : hasDelta
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-card hover:bg-muted/40',
                      )}
                    >
                      {/* Order Type badge */}
                      <Badge
                        variant='outline'
                        className={cn(
                          'shrink-0 px-1.5 py-0 text-sm font-semibold',
                          ORDER_TYPE_COLORS[item.orderType],
                        )}
                      >
                        {item.orderType}
                      </Badge>

                      {/* Model name */}
                      <span className='min-w-0 flex-1 truncate text-sm font-medium md:text-base'>
                        {item.modelName}
                      </span>

                      {/* QTY */}
                      <span className='shrink-0 text-sm text-muted-foreground'>
                        <span className='font-bold text-foreground'>
                          {item.qty}
                        </span>{' '}
                        units
                      </span>

                      {hasDelta && (
                        <Badge
                          variant='outline'
                          className={cn(
                            'shrink-0 text-sm font-semibold',
                            delta > 0
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-rose-200 bg-rose-50 text-rose-700',
                          )}
                        >
                          {delta > 0 ? `+${delta}` : `${delta}`}
                        </Badge>
                      )}
                      {/* Status / Button */}
                      {isGenerated ? (
                        <span className='flex shrink-0 items-center gap-1 text-sm font-semibold text-green-600'>
                          <CheckCircle2 className='h-3.5 w-3.5' />
                          Done
                        </span>
                      ) : (
                        <Button
                          size='sm'
                          variant='outline'
                          className='h-8 shrink-0 px-2.5 text-sm'
                          disabled={isBusy}
                          onClick={() => setDialogTarget(item)}
                        >
                          {isGenerating ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.8,
                                ease: 'linear',
                              }}
                              className='mr-1'
                            >
                              <Zap className='h-3 w-3' />
                            </motion.div>
                          ) : (
                            <Zap className='h-3 w-3 mr-1' />
                          )}
                          {isGenerating
                            ? 'Generating…'
                            : hasDelta
                              ? `Generate Sequence ${delta > 0 ? `+${delta}` : delta} units`
                              : 'Generate'}
                        </Button>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Confirmation Dialog ───────────────────────────────── */}
      <Dialog open={!!dialogTarget} onOpenChange={() => setDialogTarget(null)}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-2xl font-bold'>
              <Zap className='h-6 w-6 text-primary' />
              Generate Sequence
            </DialogTitle>
            <Separator className='my-3' />
            <DialogDescription className='text-lg text-foreground/90'>
              Generate sequence for <strong>{dialogTarget?.modelName}</strong>{' '}
              &ndash; <strong>{dialogTarget?.orderType}</strong>?<br></br>(
              {formatDateDisplay(today)}, {shift} shift,{' '}
              <strong>{dialogTarget?.qty}</strong> units)
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setDialogTarget(null)}
              className='text-lg '
            >
              Cancel
            </Button>
            <Button
              size='sm'
              className='text-lg text-white'
              onClick={() => {
                if (dialogTarget) {
                  onGenerate(
                    dialogTarget.modelId,
                    dialogTarget.modelName,
                    dialogTarget.orderType,
                  )
                  setDialogTarget(null)
                }
              }}
            >
              <Zap className='h-4 w-4 mr-1.5' />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
