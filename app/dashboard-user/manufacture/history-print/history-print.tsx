// components/production/history-print.tsx
'use client'

import { useMemo } from 'react'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PrintHistory } from '@/types/print-history'

interface HistoryPrintLabelProps {
  data: PrintHistory[]
  filteredData: PrintHistory[]
  loading: boolean
  isSearching: boolean
  dateRange: { from: string; to: string }
  setDateRange: (range: { from: string; to: string }) => void
  searchByDate: () => Promise<void>
  handleRePrint: (item: PrintHistory) => void
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
}: HistoryPrintLabelProps) {
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
          const d = new Date(date)
          const day = String(d.getDate()).padStart(2, '0')
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const year = d.getFullYear()
          return (
            <div className='text-sm whitespace-nowrap text-gray-700'>
              {`${day}-${month}-${year}`}
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
        accessorKey: 'print_datetime',
        header: 'TIME PRINT',
        cell: ({ row }) => {
          const fullStr = row.getValue('print_datetime') as string
          if (!fullStr) return <div className='text-sm text-gray-700'>-</div>
          const timePart = fullStr.split('T')[1]?.split('.')[0] || fullStr
          return (
            <div className='text-sm whitespace-nowrap text-gray-700'>
              {timePart}
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
    />
  )
}
