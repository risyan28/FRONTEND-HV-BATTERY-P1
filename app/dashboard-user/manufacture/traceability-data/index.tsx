// app/dashboard-user/manufacture/traceability-data/index.tsx
'use client'

import { PageHeader } from '@/components/production/page-header'
import { useTraceability } from '@/hooks/use-traceability'
import { TraceabilityDataTable } from './traceability-data-table'

export function TraceabilityData() {
  const {
    data,
    filteredData,
    loading,
    isSearching,
    dateRange,
    setDateRange,
    searchByDate,
  } = useTraceability()

  return (
    <div className='h-screen flex flex-col'>
      <div className='flex-shrink-0 px-2 md:px-6 py-2 md:py-4'>
        <PageHeader
          isLoading={loading || isSearching}
          title='Traceability Data'
        />
      </div>

      <div className='flex-1 min-h-0 flex flex-col'>
        <TraceabilityDataTable
          data={data}
          filteredData={filteredData}
          loading={loading}
          isSearching={isSearching}
          dateRange={dateRange}
          setDateRange={setDateRange}
          searchByDate={searchByDate}
        />
      </div>
    </div>
  )
}
