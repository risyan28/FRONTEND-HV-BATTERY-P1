// app/dashboard-user/manufacture/traceability-data/index.tsx
'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/production/page-header'
import { useTraceability } from '@/hooks/use-traceability'
import { TraceabilityDataTable } from './traceability-data-table'

export  function TraceabilityData() {
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
    <div className='w-full h-full px-2 py-4 sm:px-4 sm:py-6 lg:px-4 flex flex-col'>
      <PageHeader isLoading={loading || isSearching} title='Traceability Data' />

      {/* Kontainer utama tabel — jangan beri overflow-x di sini! */}
      <div className='flex-1 px-2 sm:px-4 lg:px-0 pb-4'>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className='h-full rounded-md border border-gray-100 bg-white/80 shadow-sm flex flex-col'
        >
          <TraceabilityDataTable
            data={data}
            filteredData={filteredData}
            loading={loading}
            isSearching={isSearching}
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchByDate={searchByDate}
          />
        </motion.div>
      </div>
    </div>
  )
}