'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ORDER_TYPES, ORDER_TYPE_COLORS } from './constants'
import type { ModelPlan, OrderType } from '@/types/prod-control'

const ORDER_TYPE_TILE_BG: Record<string, string> = {
  Assy: 'bg-blue-50 border-blue-200',
  CKD: 'bg-amber-50 border-amber-200',
  'Service Part': 'bg-green-50 border-green-200',
}

const ORDER_TYPE_NUM_COLOR: Record<string, string> = {
  Assy: 'text-blue-700',
  CKD: 'text-amber-700',
  'Service Part': 'text-green-700',
}

const DEFAULT_ACT_BY_ORDER_TYPE: Record<OrderType, number> = {
  Assy: 0,
  CKD: 0,
  'Service Part': 0,
}

interface SummaryCardsProps {
  isLoading: boolean
  models: ModelPlan[]
}

export function SummaryCards({ isLoading, models }: SummaryCardsProps) {
  const showAll = models.length > 2
  const [selected, setSelected] = useState<string>(
    showAll ? 'all' : (models[0]?.id ?? ''),
  )

  // Reset to valid selection when models change
  const selectedId = showAll
    ? selected
    : (models.find((m) => m.id === selected)?.id ?? models[0]?.id ?? '')

  const visibleModels =
    selectedId === 'all' ? models : models.filter((m) => m.id === selectedId)

  if (isLoading) {
    return (
      <Card className='rounded-xl border shadow-sm'>
        <CardHeader className='rounded-t-xl border-b bg-muted/40 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-5 w-28' />
            <Skeleton className='h-7 w-32' />
          </div>
        </CardHeader>
        <CardContent className='space-y-2 px-3 pt-3 pb-3'>
          <Skeleton className='h-14 w-full rounded-xl' />
          <Skeleton className='h-14 w-full rounded-xl' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='rounded-xl border shadow-sm'>
      {/* â”€â”€ Header with dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <CardHeader className='rounded-t-xl border-b bg-muted/40 px-3 py-2.5'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <p className='text-base font-bold leading-tight'>Plan Summary</p>
            <p className='mt-0.5 text-sm text-muted-foreground'>
              Target per order type
            </p>
          </div>
          <Select value={selectedId} onValueChange={(v) => setSelected(v)}>
            <SelectTrigger className='h-9 w-36 text-base'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {showAll && (
                <SelectItem value='all' className='text-base font-medium'>
                  All Models
                </SelectItem>
              )}
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id} className='text-base'>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {/* â”€â”€ Model rows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <CardContent className='space-y-3 px-3 pt-2.5 pb-3'>
        <AnimatePresence mode='popLayout'>
          {visibleModels.map((model, i) => {
            const totalPlan = ORDER_TYPES.reduce(
              (s, ot) => s + model.plans[ot],
              0,
            )
            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className='space-y-1.5'
              >
                {/* Model name + total */}
                <div className='flex items-center justify-between'>
                  <span className='text-base font-bold text-foreground'>
                    {model.name}
                  </span>
                  <span className='text-sm text-muted-foreground md:text-base'>
                    Total:{' '}
                    <span className='font-bold text-primary'>{totalPlan}</span>{' '}
                    units
                  </span>
                </div>

                {/* 3 order-type tiles in a row */}
                <div className='grid grid-cols-3 gap-2'>
                  {ORDER_TYPES.map((ot) => (
                    <div
                      key={ot}
                      className={cn(
                        'flex flex-col rounded-xl border px-2.5 pt-2 pb-2.5 gap-1',
                        'flex flex-col gap-1 rounded-xl border px-2.5 py-2',
                        ORDER_TYPE_TILE_BG[ot],
                      )}
                    >
                      <Badge
                        variant='outline'
                        className={cn(
                          'w-fit self-center px-1.5 py-0 text-sm font-semibold text-center',
                          ORDER_TYPE_COLORS[ot],
                        )}
                      >
                        {ot}
                      </Badge>
                      <div className='grid grid-cols-2 items-end gap-2'>
                        <div>
                          <p
                            className={cn(
                              'mt-0.5 text-5xl font-black leading-none',
                              ORDER_TYPE_NUM_COLOR[ot],
                            )}
                          >
                            {model.plans[ot]}
                          </p>
                          <span className='text-sm text-muted-foreground'>
                            Plan
                          </span>
                        </div>
                        <div className='text-right'>
                          <p
                            className={cn(
                              'mt-0.5 text-5xl font-black leading-none',
                              ORDER_TYPE_NUM_COLOR[ot],
                            )}
                          >
                            {DEFAULT_ACT_BY_ORDER_TYPE[ot]}
                          </p>
                          <span className='text-sm text-muted-foreground'>
                            Act
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
