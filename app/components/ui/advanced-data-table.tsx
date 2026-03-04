'use client'

import { useMemo, useState, useRef } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Search, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'

interface AdvancedDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  loading?: boolean
  isSearching?: boolean
  showDateFilter?: boolean
  dateRange?: { from: string; to: string }
  setDateRange?: (range: { from: string; to: string }) => void
  onSearch?: () => Promise<void>
  globalFilterPlaceholder?: string
}

export function AdvancedDataTable<TData>({
  data,
  columns,
  loading = false,
  isSearching = false,
  showDateFilter = false,
  dateRange,
  setDateRange,
  onSearch,
  globalFilterPlaceholder = 'Search...',
}: AdvancedDataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('')
  const fromDateRef = useRef<HTMLInputElement>(null)
  const toDateRef = useRef<HTMLInputElement>(null)

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (loading && !isSearching) {
    return (
      <div className='flex-1 px-4 sm:px-6 lg:px-8'>
        <div className='h-full rounded-xl bg-gray-200 animate-pulse' />
      </div>
    )
  }

  return (
    <div className='flex-1 flex flex-col gap-5 min-h-0 p-6'>
      {/* Date Filter & Search - Fixed, tidak scroll */}
      <div className='flex flex-col gap-3 flex-shrink-0'>
        {showDateFilter && dateRange && setDateRange && onSearch && (
          <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-end'>
            <div className='flex flex-col'>
              <label className='text-sm font-medium mb-1 text-gray-700'>
                From Date
              </label>
              <div className='relative'>
                <input
                  ref={fromDateRef}
                  type='date'
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement
                    target.showPicker?.()
                  }}
                  className='border-2 border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm w-full bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer'
                />
                <Calendar
                  className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer z-10'
                  aria-hidden='true'
                  onClick={() => fromDateRef.current?.showPicker()}
                />
              </div>
            </div>

            <div className='flex flex-col'>
              <label className='text-sm font-medium mb-1 text-gray-700'>
                To Date
              </label>
              <div className='relative'>
                <input
                  ref={toDateRef}
                  type='date'
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement
                    target.showPicker?.()
                  }}
                  className='border-2 border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm w-full bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer'
                />
                <Calendar
                  className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer z-10'
                  aria-hidden='true'
                  onClick={() => toDateRef.current?.showPicker()}
                />
              </div>
            </div>

            <Button
              size='sm'
              onClick={onSearch}
              disabled={isSearching}
              className='h-10 px-6 mt-1 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all'
            >
              {isSearching ? (
                <span className='flex items-center'>
                  <div className='h-4 w-4 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2' />
                  Searching...
                </span>
              ) : (
                <>
                  <Search className='mr-2 h-4 w-4' />
                  Search
                </>
              )}
            </Button>
          </div>
        )}

        {/* Search Box - Aligned to the right */}
        <div className='flex justify-end'>
          <div className='relative w-80'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={globalFilterPlaceholder}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {isSearching ? (
        <div className='flex flex-col gap-3 bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
          <div className='h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse w-1/4' />
          <div className='space-y-3'>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='h-12 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg animate-pulse'
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Pagination - Di atas table */}
          <div className='flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-t-lg'>
            <div className='flex items-center gap-3'>
              <span className='text-sm font-semibold text-gray-800'>
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </span>
              <span className='text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200'>
                {table.getFilteredRowModel().rows.length} rows
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className='border-2 hover:bg-blue-50 hover:border-blue-300 transition-all'
              >
                First
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className='border-2 hover:bg-blue-50 hover:border-blue-300 transition-all'
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className='border-2 hover:bg-blue-50 hover:border-blue-300 transition-all'
              >
                Next
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className='border-2 hover:bg-blue-50 hover:border-blue-300 transition-all'
              >
                Last
              </Button>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
                className='border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white'
              >
                {[10, 20, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrollable Table Container */}
          <div className='flex-1 min-h-0 border-2 border-t-0 border-gray-200 rounded-b-xl bg-white overflow-hidden shadow-lg'>
            <div className='overflow-x-auto overflow-y-auto h-full'>
              <table className='border-collapse text-sm min-w-max w-full'>
                <thead className='bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10'>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className='border-b-2 border-r border-gray-200 px-4 py-4 text-left font-bold text-gray-800 whitespace-nowrap'
                          style={{
                            minWidth: header.id === 'no' ? '70px' : '220px',
                            position: header.id === 'no' ? 'sticky' : 'static',
                            left: header.id === 'no' ? 0 : undefined,
                            zIndex: header.id === 'no' ? 20 : undefined,
                            background:
                              header.id === 'no'
                                ? 'linear-gradient(to right, #f9fafb, #f3f4f6)'
                                : undefined,
                            boxShadow:
                              header.id === 'no'
                                ? '2px 0 8px -2px rgba(0,0,0,0.1)'
                                : undefined,
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className='text-center py-12 text-gray-500 border-b'
                      >
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-blue-50 transition-all duration-150 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`border-b border-r border-gray-200 px-4 py-3 ${
                              cell.column.id === 'no'
                                ? 'sticky left-0 bg-inherit z-10 font-semibold'
                                : ''
                            }`}
                            style={{
                              minWidth:
                                cell.column.id === 'no' ? '70px' : '220px',
                              ...(cell.column.id === 'no' && {
                                boxShadow: '2px 0 8px -2px rgba(0,0,0,0.1)',
                              }),
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
