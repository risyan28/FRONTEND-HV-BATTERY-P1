import { Link } from 'react-router-dom'
import { Grid } from 'lucide-react'
import type { BottomNavProps } from './types'

export function BottomNav({ onMenuClick }: BottomNavProps) {
  return (
    <div className='fixed bottom-0 left-0 right-0 border-t bg-white shadow-lg md:hidden z-50'>
      <div className='flex justify-around items-end px-2 py-3 pb-safe'>
        <Link
          to='#'
          className='flex flex-col items-center gap-1 text-xs text-purple-700 min-w-[60px]'
        >
          <div className='flex h-8 w-8 items-center justify-center text-lg'>
            <span>📦</span>
          </div>
          <span className='text-[10px] font-medium'>Plan</span>
        </Link>
        <Link
          to='#'
          className='flex flex-col items-center gap-1 text-xs text-gray-600 min-w-[60px]'
        >
          <div className='flex h-8 w-8 items-center justify-center text-lg'>
            <span>⚙️</span>
          </div>
          <span className='text-[10px] font-medium'>Output</span>
        </Link>
        <button
          onClick={onMenuClick}
          className='flex flex-col items-center gap-1 focus:outline-none -mt-6 min-w-[60px]'
        >
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg'>
            <Grid className='h-6 w-6' />
          </div>
          <span className='text-[10px] font-semibold text-purple-700'>
            Menu
          </span>
        </button>

        <Link
          to='#'
          className='flex flex-col items-center gap-1 text-xs text-gray-600 min-w-[60px]'
        >
          <div className='flex h-8 w-8 items-center justify-center text-lg'>
            <span>❌</span>
          </div>
          <span className='text-[10px] font-medium'>Defect</span>
        </Link>
        <Link
          to='#'
          className='flex flex-col items-center gap-1 text-xs text-gray-600 min-w-[60px]'
        >
          <div className='flex h-8 w-8 items-center justify-center text-lg'>
            <span>👤</span>
          </div>
          <span className='text-[10px] font-medium'>Profile</span>
        </Link>
      </div>
    </div>
  )
}
