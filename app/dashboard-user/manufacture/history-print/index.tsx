// routes atau page utama: misal app/routes/history-print.tsx
'use client'
import { PageHeader } from '@/components/production/page-header'
import { usePrintHistory } from '@/hooks/use-print-history'
import { HistoryPrintLabel } from './history-print'

export function HistoryPrint() {
  const {
    data,
    filteredData,
    loading,
    isSearching,
    dateRange,
    setDateRange,
    searchByDate,
    handleRePrint,
  } = usePrintHistory()

  return (
    <div className='h-screen flex flex-col'>
      <div className='flex-shrink-0 px-2 md:px-6 py-2 md:py-4'>
        <PageHeader
          isLoading={loading || isSearching}
          title='History Printing'
        />
      </div>

      <div className='flex-1 min-h-0 flex flex-col'>
        <HistoryPrintLabel
          data={data}
          filteredData={filteredData}
          loading={loading}
          isSearching={isSearching}
          dateRange={dateRange}
          setDateRange={setDateRange}
          searchByDate={searchByDate}
          handleRePrint={handleRePrint}
        />
      </div>
    </div>
  )
}
