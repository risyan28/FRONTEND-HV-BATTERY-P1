'use client'

import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { TraceabilityData } from '@/types/traceability'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'

// Helper function to format datetime
const formatDateTime = (value: any): string => {
  if (!value) return '-'
  if (
    typeof value === 'string' &&
    (value.includes('T') || value.includes('Z'))
  ) {
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
        cell: ({ row }) => (
          <div className='text-sm whitespace-nowrap text-gray-700'>
            {row.getValue('PACK_ID') || '-'}
          </div>
        ),
        size: 200,
      },
      {
        accessorKey: 'MODULE_1',
        header: 'MODULE_1',
        cell: ({ row }) => (
          <div className='text-sm whitespace-nowrap text-gray-700'>
            {row.getValue('MODULE_1') || '-'}
          </div>
        ),
        size: 200,
      },
      {
        accessorKey: 'MODULE_2',
        header: 'MODULE_2',
        cell: ({ row }) => (
          <div className='text-sm whitespace-nowrap text-gray-700'>
            {row.getValue('MODULE_2') || '-'}
          </div>
        ),
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

          // Convert numeric 0/1 to OK/NG for specific columns
          if (
            key === 'Self_Discharge_Value_Judge_Module' ||
            key === 'Inspection_judgment_Overall_judgment_InspMachine'
          ) {
            const numVal = Number(value)
            const val =
              numVal === 0 ? 'OK' : numVal === 1 ? 'NG' : String(value || '-')
            return (
              <div className='whitespace-nowrap'>
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                    val === 'OK'
                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                      : val === 'NG'
                        ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                  }`}
                >
                  {val}
                </span>
              </div>
            )
          }

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

          // Render badge untuk OK/NG/NotOK/- di kolom manapun
          if (
            formatted === 'OK' ||
            formatted === 'NG' ||
            formatted === 'NotOK' ||
            formatted === '-'
          ) {
            return (
              <div className='whitespace-nowrap'>
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                    formatted === 'OK'
                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                      : formatted === 'NG' || formatted === 'NotOK'
                        ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                  }`}
                >
                  {formatted}
                </span>
              </div>
            )
          }

          return (
            <div className='text-sm whitespace-nowrap text-gray-700'>
              {formatted}
            </div>
          )
        },
        size: 200,
      })
    })

    return dynamicColumns
  }, [data])

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
      globalFilterPlaceholder='Search all columns...'
    />
  )
}
