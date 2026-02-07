'use client'

import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Calendar, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TraceabilityData } from '@/types/traceability'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'

// Helper function to format datetime
const formatDateTime = (value: any): string => {
  if (!value) return '-'
  if (typeof value === 'string' && (value.includes('T') || value.includes('Z'))) {
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  return String(value)
}

export function TraceabilityDataTable({
  data,
  filteredData,
  loading,
  isSearching,
  dateRange,
  setDateRange,
  searchByDate,
}: {
  data: TraceabilityData[]
  filteredData: TraceabilityData[]
  loading: boolean
  isSearching: boolean
  dateRange: { from: string; to: string }
  setDateRange: (range: { from: string; to: string }) => void
  searchByDate: () => Promise<void>
}) {
  // Generate columns dynamically from first data item
  const columns: ColumnDef<TraceabilityData>[] = useMemo(() => {
    // Default columns when no data
    const defaultColumns: ColumnDef<TraceabilityData>[] = [
      {
        id: 'no',
        header: 'NO',
        cell: ({ row }) => (
          <div className='text-center font-medium'>{row.index + 1}</div>
        ),
        size: 60,
        enableSorting: false,
      },
      {
        accessorKey: 'PACK_ID',
        header: 'PACK_ID',
        cell: ({ row }) => <div className='text-sm whitespace-nowrap text-gray-700'>{row.getValue('PACK_ID') || '-'}</div>,
        size: 200,
      },
      {
        accessorKey: 'MODULE_1',
        header: 'MODULE_1',
        cell: ({ row }) => <div className='text-sm whitespace-nowrap text-gray-700'>{row.getValue('MODULE_1') || '-'}</div>,
        size: 200,
      },
      {
        accessorKey: 'MODULE_2',
        header: 'MODULE_2',
        cell: ({ row }) => <div className='text-sm whitespace-nowrap text-gray-700'>{row.getValue('MODULE_2') || '-'}</div>,
        size: 200,
      },
      {
        accessorKey: 'JUDGEMENT_VALUE',
        header: 'JUDGEMENT_VALUE',
        cell: ({ row }) => {
          const val = String(row.getValue('JUDGEMENT_VALUE') || '-')
          return (
            <div className='whitespace-nowrap'>
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                  val === 'OK'
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                    : val === 'NG' || val === 'NotOK'
                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                }`}
              >
                {val}
              </span>
            </div>
          )
        },
        size: 200,
      },
    ]

    if (!data || data.length === 0) return defaultColumns

    const firstItem = data[0]
    const allKeys = Object.keys(firstItem)

    const dynamicColumns: ColumnDef<TraceabilityData>[] = [
      {
        id: 'no',
        header: 'NO',
        cell: ({ row }) => (
          <div className='text-center font-medium'>{row.index + 1}</div>
        ),
        size: 60,
        enableSorting: false,
      },
    ]

    allKeys.forEach((key) => {
      dynamicColumns.push({
        accessorKey: key,
        header: key,
        cell: ({ row }) => {
          const value = row.getValue(key)

          if (key.includes('JUDGEMENT') || key.includes('JUDGE')) {
            const val = String(value || '-')
            return (
              <div className='whitespace-nowrap'>
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                    val === 'OK'
                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                      : val === 'NG' || val === 'NotOK'
                      ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                  }`}
                >
                  {val}
                </span>
              </div>
            )
          }

          const formatted = formatDateTime(value)
          return <div className='text-sm whitespace-nowrap text-gray-700'>{formatted}</div>
        },
        size: 200,
      })
    })

    return dynamicColumns
  }, [filteredData])

  const table = useReactTable({
    data: filteredData,
    columns,
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
      {/* Date Filter - Fixed, tidak scroll */}
      <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-end flex-shrink-0'>
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

      {isSearching ? (
        <div className='flex flex-col gap-3 bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
          <div className='h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse w-1/4' />
          <div className='space-y-3'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-12 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg animate-pulse' />
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
                {filteredData.length} rows
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

          {/* Scrollable Table Container — HANYA INI YANG SCROLL HORIZONTAL */}
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
                            minWidth:
                              header.id === 'no' ? '70px' : '220px',
                            position: header.id === 'no' ? 'sticky' : 'static',
                            left: header.id === 'no' ? 0 : undefined,
                            zIndex: header.id === 'no' ? 20 : undefined,
                            background: header.id === 'no' ? 'linear-gradient(to right, #f9fafb, #f3f4f6)' : undefined,
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
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
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
                            minWidth: cell.column.id === 'no' ? '70px' : '220px',
                            ...(cell.column.id === 'no' && {
                              boxShadow: '2px 0 8px -2px rgba(0,0,0,0.1)',
                            }),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
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