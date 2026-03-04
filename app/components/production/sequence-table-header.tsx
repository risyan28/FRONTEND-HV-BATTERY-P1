import { Plus } from 'lucide-react'

interface SequenceTableHeaderProps {
  addManualSeq: () => void
}

export function SequenceTableHeader({
  addManualSeq,
}: SequenceTableHeaderProps) {
  return (
    <div className='mb-3 md:mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3'>
      {/* Kiri - Legend */}
      <div className='flex items-center gap-2 md:gap-4 flex-wrap'>
        <div className='flex items-center'>
          <div className='mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 bg-yellow-400'></div>
          <span className='text-xs md:text-sm'>Current</span>
        </div>
        <div className='flex items-center'>
          <div className='mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 bg-green-500'></div>
          <span className='text-xs md:text-sm'>History</span>
        </div>
        <div className='flex items-center'>
          <div className='mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 bg-slate-300'></div>
          <span className='text-xs md:text-sm'>Next Sequence</span>
        </div>
      </div>

      {/* Kanan - Add Button */}
      <button
        onClick={addManualSeq}
        className='flex items-center gap-1.5 md:gap-2 rounded-lg bg-black px-2 md:px-3 py-1.5 md:py-1 text-xs md:text-sm text-white h-8 md:h-10 cursor-pointer whitespace-nowrap'
      >
        <Plus size={14} className='md:w-4 md:h-4' />
        <span className='hidden sm:inline'>Add Manual Sequence</span>
        <span className='sm:hidden'>Add Manual</span>
      </button>
    </div>
  )
}
