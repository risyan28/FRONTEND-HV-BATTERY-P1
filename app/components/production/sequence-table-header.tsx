import { Plus } from 'lucide-react'

interface SequenceTableHeaderProps {
  addManualSeq: () => void
}

export function SequenceTableHeader({
  addManualSeq,
}: SequenceTableHeaderProps) {
  return (
    <div className='mb-4 flex items-center justify-between'>
      {/* Kiri */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center'>
          <div className='mr-2 h-4 w-4 bg-yellow-400'></div>
          <span className='text-sm'>Current</span>
        </div>
        <div className='flex items-center'>
          <div className='mr-2 h-4 w-4 bg-green-500'></div>
          <span className='text-sm'>History</span>
        </div>
        <div className='flex items-center'>
          <div className='mr-2 h-4 w-4 bg-slate-300'></div>
          <span className='text-sm'>Next Sequence</span>
        </div>
      </div>

      {/* Kanan */}
      <button
        onClick={addManualSeq}
        className='flex items-center gap-2 rounded-lg bg-black px-3 py-1 text-sm text-white h-10 cursor-pointer'
      >
        <Plus size={16} />
        Add Manual Sequence
      </button>
    </div>
  )
}
