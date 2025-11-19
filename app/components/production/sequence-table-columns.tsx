export function SequenceTableColumns() {
  return (
    <colgroup>
      <col style={{ width: '8%' }} />
      <col style={{ width: '12%' }} />
      <col style={{ width: '10%' }} />
      <col style={{ width: '10%' }} />
      <col style={{ width: '20%' }} />
      <col style={{ width: '10%' }} />
      <col style={{ width: '15%' }} />
      <col style={{ width: '15%' }} />
      <col style={{ width: '10%' }} />
      <col style={{ width: '15%' }} />
    </colgroup>
  )
}

export function SequenceTableHead() {
  return (
    <thead className='sticky top-0 z-10 bg-slate-100 dark:bg-slate-800'>
      <tr className='border-b border-slate-200 dark:border-slate-700'>
        <th className='px-2 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400'>
          NO SEQ
        </th>
        <th className='px-2 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400'>
          TYPE BATTERY
        </th>
        <th className='px-2 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400'>
          SEQ K0
        </th>
        <th className='px-2 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400'>
          BODY NO
        </th>
        <th className='px-2 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400'>
          BARCODE
        </th>
        <th className='px-2 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400'>
          DATA FROM
        </th>
        <th className='px-2 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400'>
          TIME RECEIVED ALC
        </th>
        <th className='px-2 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400'>
          TIME PRINT LABEL
        </th>
        <th className='px-2 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400'>
          STATUS
        </th>
        <th className='px-2 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400'>
          ACTIONS
        </th>
      </tr>
    </thead>
  )
}
