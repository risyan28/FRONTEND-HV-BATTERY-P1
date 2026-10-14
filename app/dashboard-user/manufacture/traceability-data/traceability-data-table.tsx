'use client'

import { useMemo, useState } from 'react'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import type { TraceabilityData } from '@/types/traceability'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { formatJakartaDateTimeFull } from '@/lib/datetime'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

function toImageUrl(value: unknown): string | null {
  if (typeof value === 'string' && value.startsWith('data:image/')) {
    return value
  }
  if (value === null || typeof value !== 'object') {
    return null
  }
  const bufferLike = value as { type: string; data: number[] }
  if (bufferLike.type === 'Buffer' && Array.isArray(bufferLike.data)) {
    const base64 = new Uint8Array(bufferLike.data).reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      '',
    )
    return `data:image/jpeg;base64,${btoa(base64)}`
  }
  return null
}

// Helper function to generate preset visibility configurations
function generatePresetVisibility(
  allColumnIds: string[],
  preset:
    | 'module'
    | 'manual'
    | 'inspection'
    | 'final_judgement'
    | 'ecu_id'
    | 'all',
): VisibilityState {
  const visibility: VisibilityState = {}

  // Core columns that MUST be visible in ALL presets
  const coreColumns = [
    'no',
    'PACK_ID',
    'MODULE_1',
    'MODULE_2',
    'OVERALL_JUDGEMENT',
    'PROD_DATE',
  ]

  // Define column categories based on keyword patterns
  const moduleColumns = [
    ...coreColumns,
    ...allColumnIds.filter(
      (col) =>
        col.includes('Module') ||
        col.includes('_Module') ||
        col.includes('MODULE_1') ||
        col.includes('MODULE_2'),
    ),
  ]

  const manualWorkColumns = [
    ...coreColumns,
    ...allColumnIds.filter(
      (col) =>
        col.includes('_Angle') ||
        col.includes('_Torque') ||
        col.includes('_Result'),
    ),
  ]

  const inspectionColumns = [
    ...coreColumns,
    ...allColumnIds.filter(
      (col) => col.includes('_InspMachine') && col !== 'ID_InspMachine',
    ),
  ]

  const finalJudgementColumns = [
    ...coreColumns,
    ...allColumnIds.filter((col) => col.includes('_FINAL_JUDGE')),
  ]
  // Add camera images to final judgement if they exist
  if (allColumnIds.includes('CAM_IMG1')) {
    finalJudgementColumns.push('CAM_IMG1')
  }
  if (allColumnIds.includes('CAM_IMG2')) {
    finalJudgementColumns.push('CAM_IMG2')
  }

  const ecuIdColumns = [
    'no',
    'PACK_ID',
    'MODULE_1',
    'MODULE_2',
    ...allColumnIds.filter((col) => col === 'ECU_ID'),
    'OVERALL_JUDGEMENT',
    'PROD_DATE',
  ]

  // Apply preset visibility
  const presetColumns =
    preset === 'module'
      ? moduleColumns
      : preset === 'manual'
        ? manualWorkColumns
        : preset === 'inspection'
          ? inspectionColumns
          : preset === 'final_judgement'
            ? finalJudgementColumns
            : preset === 'ecu_id'
              ? ecuIdColumns
              : allColumnIds

  allColumnIds.forEach((col) => {
    visibility[col] = presetColumns.includes(col)
  })

  return visibility
}

export function TraceabilityDataTable({
  data,
  filteredData,
  loading,
  isSearching,
  dateRange,
  setDateRange,
  searchByDate,
  enableExcelDownload = true,
}: {
  data: TraceabilityData[]
  filteredData: TraceabilityData[]
  loading: boolean
  isSearching: boolean
  dateRange: { from: string; to: string }
  setDateRange: (range: { from: string; to: string }) => void
  searchByDate: () => Promise<void>
  enableExcelDownload?: boolean
}) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [activePreset, setActivePreset] = useState<string>('all')

  const handlePresetSelect = (
    preset:
      | 'module'
      | 'manual'
      | 'inspection'
      | 'final_judgement'
      | 'ecu_id'
      | 'all',
  ) => {
    if (columns.length > 0) {
      const columnIds = columns
        .map((col) => {
          if ('id' in col && col.id) return col.id
          if ('accessorKey' in col && col.accessorKey)
            return col.accessorKey as string
          return undefined
        })
        .filter((id): id is string => id !== undefined)

      const newVisibility = generatePresetVisibility(columnIds, preset)
      setColumnVisibility(newVisibility)
      setActivePreset(preset)
    }
  }

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

          if (key === 'CAM_IMG1' || key === 'CAM_IMG2') {
            const imgSrc = toImageUrl(value)
            if (imgSrc) {
              return (
                <img
                  src={imgSrc}
                  alt={key}
                  className='w-12 h-12 object-cover rounded cursor-pointer'
                  onClick={() => {
                    setPreviewSrc(imgSrc)
                    setPreviewTitle(key)
                  }}
                />
              )
            }
            return (
              <div className='text-sm whitespace-nowrap text-gray-700'>-</div>
            )
          }

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

          // Format PROD_DATE as date only (take first 10 chars: YYYY-MM-DD)
          if (key === 'PROD_DATE') {
            if (!value)
              return (
                <div className='text-sm whitespace-nowrap text-gray-700'>-</div>
              )
            const raw = String(value)
            const dateOnly = raw.length >= 10 ? raw.substring(0, 10) : raw
            return (
              <div className='text-sm whitespace-nowrap text-blue-700 font-medium'>
                {dateOnly}
              </div>
            )
          }

          const rawText =
            value === null || value === undefined ? '-' : String(value)
          // Standardize any timestamp-like value to WIB display format
          const formattedTime =
            rawText !== '-' ? formatJakartaDateTimeFull(rawText) : rawText

          // Render badge untuk OK/NG/NotOK/- di kolom manapun
          if (
            formattedTime === 'OK' ||
            formattedTime === 'NG' ||
            formattedTime === 'NotOK' ||
            formattedTime === '-'
          ) {
            return (
              <div className='whitespace-nowrap'>
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                    formattedTime === 'OK'
                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                      : formattedTime === 'NG' || formattedTime === 'NotOK'
                        ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                  }`}
                >
                  {formattedTime}
                </span>
              </div>
            )
          }

          return (
            <div className='text-sm whitespace-nowrap text-gray-700'>
              {formattedTime}
            </div>
          )
        },
        size: 200,
      })
    })

    return dynamicColumns
  }, [data])

  // Initialize columnVisibility once when columns are ready
  const columnsInitialized = useMemo(() => {
    if (
      columns.length > 0 &&
      activePreset === 'all' &&
      Object.keys(columnVisibility).length === 0
    ) {
      // Initialize with all columns visible on first load
      const initialVisibility: VisibilityState = {}
      columns.forEach((col) => {
        if ('id' in col && col.id) {
          initialVisibility[col.id] = true
        } else if ('accessorKey' in col && col.accessorKey) {
          initialVisibility[col.accessorKey as string] = true
        }
      })
      setColumnVisibility(initialVisibility)
    }
  }, [columns, activePreset, columnVisibility])

  return (
    <>
      <AdvancedDataTable
        data={filteredData}
        columns={columns}
        frozenColumnIds={['PACK_ID']}
        loading={loading}
        isSearching={isSearching}
        showDateFilter={true}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onSearch={searchByDate}
        globalFilterPlaceholder='Search all columns...'
        enableExcelDownload={enableExcelDownload}
        excelFileName='traceability-data'
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        presetButtons={
          <div className='flex flex-wrap gap-2 items-center'>
            <Button
              size='sm'
              variant={activePreset === 'all' ? 'default' : 'outline'}
              onClick={() => handlePresetSelect('all')}
              className={`text-xs h-8 ${
                activePreset === 'all'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-50'
              }`}
            >
              ALL
            </Button>
            <Button
              size='sm'
              variant={activePreset === 'module' ? 'default' : 'outline'}
              onClick={() => handlePresetSelect('module')}
              className={`text-xs h-8 ${
                activePreset === 'module'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-50'
              }`}
            >
              Module Inspection
            </Button>
            <Button
              size='sm'
              variant={activePreset === 'ecu_id' ? 'default' : 'outline'}
              onClick={() => handlePresetSelect('ecu_id')}
              className={`text-xs h-8 ${
                activePreset === 'ecu_id'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-50'
              }`}
            >
              ECU ID
            </Button>
            <Button
              size='sm'
              variant={activePreset === 'manual' ? 'default' : 'outline'}
              onClick={() => handlePresetSelect('manual')}
              className={`text-xs h-8 ${
                activePreset === 'manual'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-50'
              }`}
            >
              Manual Work
            </Button>
            <Button
              size='sm'
              variant={activePreset === 'inspection' ? 'default' : 'outline'}
              onClick={() => handlePresetSelect('inspection')}
              className={`text-xs h-8 ${
                activePreset === 'inspection'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-50'
              }`}
            >
              Inspection Module
            </Button>
            <Button
              size='sm'
              variant={
                activePreset === 'final_judgement' ? 'default' : 'outline'
              }
              onClick={() => handlePresetSelect('final_judgement')}
              className={`text-xs h-8 ${
                activePreset === 'final_judgement'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-50'
              }`}
            >
              Final Judgement
            </Button>
          </div>
        }
      />

      <Dialog
        open={previewSrc !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewSrc(null)
            setPreviewTitle('')
          }
        }}
      >
        <DialogContent className='sm:max-w-3xl'>
          <DialogTitle>{previewTitle}</DialogTitle>
          {previewSrc && (
            <img
              src={previewSrc}
              alt='Preview'
              className='max-h-[70vh] w-auto mx-auto'
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
