'use client'

import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { CheckCircle2, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { ORDER_TYPE_COLORS } from './constants'
import type { PlanHistory, OrderType } from '@/types/prod-control'

const getTodayISO = () => new Date().toISOString().split('T')[0]

const formatDateShort = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const formatDateTimeFull = (value: string) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value

  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

interface HistoryTableProps {
  isLoading: boolean
  history: PlanHistory[]
}

export function HistoryTable({ isLoading, history }: HistoryTableProps) {
  const today = getTodayISO()
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [appliedFrom, setAppliedFrom] = useState(today)
  const [appliedTo, setAppliedTo] = useState(today)
  const [isSearching, setIsSearching] = useState(false)

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      if (appliedFrom && h.date < appliedFrom) return false
      if (appliedTo && h.date > appliedTo) return false
      return true
    })
  }, [history, appliedFrom, appliedTo])
  const columns = useMemo<ColumnDef<PlanHistory>[]>(
    () => [
      {
        id: 'no',
        header: 'NO',
        cell: ({ row }) => (
          <div className='text-center font-medium'>{row.index + 1}</div>
        ),
        size: 52,
        enableSorting: false,
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ getValue }) => (
          <span className='whitespace-nowrap font-medium text-blue-700'>
            {formatDateShort(getValue() as string)}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: 'shift',
        header: 'Shift',
        cell: ({ getValue }) => (
          <span className='whitespace-nowrap font-semibold'>
            {getValue() as string}
          </span>
        ),
        size: 70,
      },
      {
        accessorKey: 'orderType',
        header: 'Order Type',
        cell: ({ getValue }) => {
          const ot = getValue() as OrderType
          return (
            <Badge
              variant='outline'
              className={cn(
                'text-xs font-semibold whitespace-nowrap',
                ORDER_TYPE_COLORS[ot],
              )}
            >
              {ot}
            </Badge>
          )
        },
        size: 120,
      },
      {
        accessorKey: 'modelName',
        header: 'Model',
        cell: ({ getValue }) => (
          <span className='whitespace-nowrap'>{getValue() as string}</span>
        ),
        size: 120,
      },
      {
        accessorKey: 'plan',
        header: 'Plan (QTY)',
        cell: ({ getValue }) => (
          <span className='font-bold'>{getValue() as number}</span>
        ),
        size: 90,
      },
      {
        accessorKey: 'sequenceGenerated',
        header: 'Seq. Generated',
        cell: ({ getValue }) =>
          getValue() ? (
            <div className='flex justify-center'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
            </div>
          ) : (
            <div className='flex justify-center'>
              <Minus className='h-4 w-4 text-muted-foreground' />
            </div>
          ),
        size: 120,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ getValue }) => (
          <span className='whitespace-nowrap text-muted-foreground'>
            {formatDateTimeFull(getValue() as string)}
          </span>
        ),
        size: 130,
      },
    ],
    [],
  )

  return (
    <div className='h-full min-h-0 [&_.advanced-history-root]:gap-3 [&_.advanced-history-root]:p-3 [&_input]:text-sm [&_label]:text-sm [&_select]:text-sm [&_table]:text-sm md:[&_table]:text-base [&_thead_th]:px-3 [&_thead_th]:py-3 [&_tbody_td]:px-3 [&_tbody_td]:py-2.5'>
      <div className='advanced-history-root h-full min-h-0'>
        <AdvancedDataTable
          data={filteredHistory}
          columns={columns}
          loading={isLoading}
          showDateFilter={true}
          dateRange={{ from: dateFrom, to: dateTo }}
          setDateRange={(range) => {
            setDateFrom(range.from)
            setDateTo(range.to)
          }}
          isSearching={isSearching}
          onSearch={async () => {
            setIsSearching(true)
            await new Promise((r) => setTimeout(r, 400))
            setAppliedFrom(dateFrom)
            setAppliedTo(dateTo)
            setIsSearching(false)
          }}
          globalFilterPlaceholder='Search history...'
          enableExcelDownload={true}
          excelFileName='planning-history'
        />
      </div>
    </div>
  )
}
