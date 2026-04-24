// components/production/history-print.tsx
'use client'

import { useMemo } from 'react'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PrintHistory } from '@/types/print-history'
import { formatJakartaDateTimeFull, toJakartaISODate } from '@/lib/datetime'

interface HistoryPrintLabelProps {
  data: PrintHistory[]
  filteredData: PrintHistory[]
  loading: boolean
  isSearching: boolean
  dateRange: { from: string; to: string }
  setDateRange: (range: { from: string; to: string }) => void
  searchByDate: () => Promise<void>
  handleRePrint: (item: PrintHistory) => void
  enableExcelDownload?: boolean
}

export function HistoryPrintLabel({
  data,
  filteredData,
  loading,
  isSearching,
  dateRange,
  setDateRange,
  searchByDate,
  handleRePrint,
  enableExcelDownload = true,
}: HistoryPrintLabelProps) {
  const toOrdinal = (value: number): string => {
    const mod100 = value % 100
    if (mod100 >= 11 && mod100 <= 13) return `${value}th`

    const mod10 = value % 10
    if (mod10 === 1) return `${value}st`
    if (mod10 === 2) return `${value}nd`
    if (mod10 === 3) return `${value}rd`
    return `${value}th`
  }

  const columns: ColumnDef<PrintHistory>[] = useMemo(
    () => [
      {
        id: 'no',
        header: 'NO',
        cell: ({ row }) => (
          <div className='text-center font-medium'>{row.index + 1}</div>
        ),
        enableSorting: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'battery_pack_id',
        header: 'BATTERY PACK ID',
        cell: ({ row }) => (
          <div className='text-sm whitespace-nowrap text-gray-700'>
            {row.getValue('battery_pack_id') || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'production_date',
        header: 'PRODUCTION DATE',
        cell: ({ row }) => {
          const date = row.getValue('production_date') as string
          if (!date) return <div className='text-sm text-gray-700'>-</div>
          return (
            <div className='text-sm whitespace-nowrap text-gray-700'>
              {String(toJakartaISODate(date)).slice(0, 10)}
            </div>
          )
        },
      },
      {
        accessorKey: 'shift',
        header: 'SHIFT',
        cell: ({ row }) => (
          <div className='text-sm whitespace-nowrap text-gray-700'>
            {row.getValue('shift') || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'order_type',
        header: 'ORDER TYPE',
        cell: ({ row }) => {
          const val = row.getValue('order_type') as string | null | undefined
          return (
            <div className='text-sm whitespace-nowrap text-gray-700'>
              {val || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'print_type',
        header: 'PRINT TYPE',
        cell: ({ row }) => {
          const value = String(row.getValue('print_type') || 'FIRST PRINT')
          const isReprint = value === 'RE-PRINT'
          const sequence = Number(row.original.reprint_sequence || 0)

          return (
            <div className='whitespace-nowrap'>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                  isReprint
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {isReprint
                  ? `RE-PRINT LABEL (${toOrdinal(Math.max(sequence, 1))})`
                  : 'FIRST PRINT LABEL'}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'print_datetime',
        header: 'TIME PRINT',
        cell: ({ row }) => {
          const fullStr = row.getValue('print_datetime') as string
          if (!fullStr) return <div className='text-sm text-gray-700'>-</div>
          return (
            <div className='text-sm whitespace-nowrap text-gray-700'>
              {formatJakartaDateTimeFull(fullStr)}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'ACTION',
        cell: ({ row }) => (
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleRePrint(row.original)}
            className='flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 transition-all'
          >
            <Printer className='h-4 w-4' />
            Re-Print
          </Button>
        ),
        enableSorting: false,
        enableGlobalFilter: false,
      },
    ],
    [handleRePrint],
  )

  return (
    <AdvancedDataTable
      data={filteredData}
      columns={columns}
      loading={loading}
      isSearching={isSearching}
      showDateFilter={true}
      dateRange={dateRange}
      setDateRange={setDateRange}
      onSearch={searchByDate}
      globalFilterPlaceholder='Search by Battery Pack ID, Shift...'
      enableExcelDownload={enableExcelDownload}
      excelFileName='history-print'
    />
  )
}
