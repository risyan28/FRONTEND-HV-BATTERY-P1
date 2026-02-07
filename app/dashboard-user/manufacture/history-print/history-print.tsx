// components/production/history-print.tsx
'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { DataTable } from '@/components/ui/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Calendar, Search, Printer } from 'lucide-react'
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
        cell: ({ row }) => <span>{row.index + 1}</span>,
      },
      {
        accessorKey: 'batteryPackId',
        header: 'BATTERY PACK ID',
      },
      {
        accessorKey: 'productionDate',
        header: 'PRODUCTION DATE',
        cell: ({ row }) =>
          new Date(row.getValue('productionDate')).toLocaleDateString('id-ID'),
      },
      {
        accessorKey: 'shift',
        header: 'SHIFT',
      },
      {
        accessorKey: 'timePrint',
        header: 'TIME PRINT',
        cell: ({ row }) => {
          const fullStr = row.getValue('timePrint') as string
          const timePart = fullStr.split(' ')[1]?.split('.')[0] || fullStr
          return timePart
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
            className='flex items-center gap-1'
          >
            <Printer className='h-4 w-4' />
            Re-Print
          </Button>
        ),
      },
    ],
    [handleRePrint]
  )

  if (loading && !isSearching) {
    return (
      <div className='flex-1 px-4 sm:px-6 lg:px-8'>
        <div className='h-full rounded-xl bg-gray-200 animate-pulse' />
      </div>
    )
  }

  return (
    <div className='flex-1 flex flex-col gap-2 px-2 sm:px-4 lg:px-0 pb-4 overflow-hidden'>
      {/* Date Filter */}
      <div className='mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-end p-2'>
        <div className='flex flex-col'>
          <label className='text-sm font-medium mb-1'>From Date</label>
          <div className='relative'>
            <input
              type='date'
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className='border rounded px-2 py-1 pl-8 pr-2 text-sm w-full'
            />
            <Calendar className='absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
          </div>
        </div>

        <div className='flex flex-col'>
          <label className='text-sm font-medium mb-1'>To Date</label>
          <div className='relative'>
            <input
              type='date'
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className='border rounded px-2 py-1 pl-8 pr-2 text-sm w-full'
            />
            <Calendar className='absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
          </div>
        </div>

        <Button
          size='sm'
          onClick={searchByDate}
          disabled={isSearching}
          className='h-8 mt-1 sm:mt-0'
        >
          {isSearching ? (
            <span className='flex items-center'>
              <div className='h-4 w-4 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin mr-1' />
              Searching...
            </span>
          ) : (
            <>
              <Search className='mr-1 h-4 w-4' />
              Search
            </>
          )}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className='flex-1 rounded-md border border-gray-100 bg-white/80 p-4 shadow-sm'
      >
        {isSearching ? (
          <div className='flex flex-col gap-2'>
            <div className='h-6 bg-gray-200 rounded animate-pulse w-1/4' />
            <div className='space-y-2'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='h-10 bg-gray-100 rounded animate-pulse' />
              ))}
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            searchable={true}
            searchPlaceholder='Search by Battery Pack ID, Shift...'
            pageSizeOptions={[5, 10, 20, 50]}
            initialPageSize={10}
          />
        )}
      </motion.div>
    </div>
  )
}