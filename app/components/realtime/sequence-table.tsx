import { List, useListRef, type RowComponentProps } from 'react-window'
import { formatJakartaDateTimeFull } from '@/lib/datetime'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Sequence } from '@/types/sequence'
import { useMemo } from 'react'

interface SequenceTableProps {
  data: Sequence[]
}

interface RowProps {
  data: Sequence[]
  isMobile: boolean
  columnWidths: string[]
  mobileColumnWidths: string[]
}

const Row = ({
  index,
  style,
  data,
  isMobile,
  columnWidths,
  mobileColumnWidths,
}: RowComponentProps<RowProps>) => {
  const row = data[index]
  if (!row) return null
  return (
    <div style={style} className='flex border-b border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'>
      {/* Row content simplified without framer-motion */}
      <div style={{ flexBasis: isMobile ? mobileColumnWidths[0] : columnWidths[0] }} className='min-w-0 p-0.5 md:p-2 text-center font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 text-[10px] md:text-lg'>
        {row.FBARCODE?.slice(-7)}
      </div>
      <div style={{ flexBasis: isMobile ? mobileColumnWidths[1] : columnWidths[1] }} className='min-w-0 p-0.5 md:p-2 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 truncate font-bold text-[9px] md:text-lg'>
        {isMobile ? row.FMODEL_BATTERY.split('-')[0] : row.FMODEL_BATTERY}
      </div>
      <div style={{ flexBasis: isMobile ? mobileColumnWidths[2] : columnWidths[2] }} className='min-w-0 p-0.5 md:p-2 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 truncate font-bold text-[9px] md:text-lg'>
        {row.FSEQ_K0}
      </div>
      <div style={{ flexBasis: isMobile ? mobileColumnWidths[3] : columnWidths[3] }} className='min-w-0 p-0.5 md:p-2 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 truncate font-bold text-[9px] md:text-lg'>
        {row.FBODY_NO_K0}
      </div>
      <div style={{ flexBasis: isMobile ? mobileColumnWidths[4] : columnWidths[4] }} className='min-w-0 p-0.5 md:p-2 text-center font-mono text-[9px] md:text-xl font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 truncate'>
        {row.FBARCODE}
      </div>
      <div style={{ flexBasis: isMobile ? mobileColumnWidths[5] : columnWidths[5] }} className='min-w-0 p-0.5 md:p-2 text-center font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-600 truncate text-[9px] md:text-xl'>
        {row.FTIME_RECEIVED ? formatJakartaDateTimeFull(row.FTIME_RECEIVED) : '-'}
      </div>
      <div style={{ flexBasis: isMobile ? mobileColumnWidths[6] : columnWidths[6] }} className='min-w-0 p-0.5 md:p-2 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-[9px] md:text-lg'>
        {row.ORDER_TYPE ?? '-'}
      </div>
    </div>
  )
}

export function SequenceTable({ data }: SequenceTableProps) {
  const headers = [
    'NO SEQ',
    'TYPE BATTERY',
    'K0 SEQ',
    'NO BODY',
    'BARCODE',
    'TIME RECEIVED',
    'DATA FROM',
  ]
  const mobileHeaders = ['SEQ', 'TYPE', 'K0', 'BODY', 'BARCODE', 'TIME', 'FROM']
  const columnWidths = ['10%', '10%', '10%', '10%', '25%', '25%', '10%']
  const mobileColumnWidths = ['8%', '10%', '8%', '8%', '30%', '28%', '8%']
  const containerRef = useRef<HTMLDivElement>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const timeA = a.FID_ADJUST
      const timeB = b.FID_ADJUST
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })
  }, [data, sortOrder])

  const listRef = useListRef(null)

  const scrollToBottom = useCallback(() => {
    if (sortedData.length > 0) {
      listRef.current?.scrollToRow({
        index: sortedData.length - 1,
        align: 'end',
        behavior: 'auto',
      })
    }
  }, [sortedData.length, listRef])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const rowProps = useMemo(
    () => ({
      data: sortedData,
      isMobile,
      columnWidths,
      mobileColumnWidths,
    }),
    [sortedData, isMobile],
  )

  return (
    <div className='flex-[80] md:flex-[80] rounded-lg border border-border overflow-hidden shadow-sm flex flex-col h-full'>
      <div className='flex flex-col h-full overflow-hidden'>
        <div className='flex text-lg font-bold bg-gray-400 h-7 md:h-12'>
          {headers.map((header, index) => (
            <div
              key={header}
              style={{
                flexBasis: isMobile
                  ? mobileColumnWidths[index]
                  : columnWidths[index],
                flexGrow: 0,
                flexShrink: 0,
              }}
              className={`min-w-0 p-0.5 md:p-2 text-center text-slate-900 last:border-r-0 flex items-center justify-center text-xs md:text-lg ${
                header === 'BARCODE' ||
                header === 'TIME RECEIVED' ||
                header === 'DATA FROM'
                  ? 'md:text-2xl'
                  : ''
              }`}
            >
              <span className='hidden md:inline'>{header}</span>
              <span className='md:hidden text-[9px] leading-tight'>
                {mobileHeaders[index]}
              </span>
            </div>
          ))}
        </div>

        <div ref={containerRef} className='flex-1 bg-white dark:bg-slate-800 w-full min-h-0'>
          <List
            rowCount={sortedData.length}
            rowHeight={isMobile ? 30 : 50}
            rowComponent={Row}
            rowProps={rowProps}
            defaultHeight={500}
            listRef={listRef}
            onResize={scrollToBottom}
            className='w-full h-full'
          />
        </div>
      </div>
    </div>
  )
}
