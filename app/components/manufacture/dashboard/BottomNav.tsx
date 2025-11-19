import { Link } from 'react-router-dom'
import { Grid } from 'lucide-react'
import type { BottomNavProps } from './types'

export function BottomNav({ onMenuClick }: BottomNavProps) {
  return (
    <div className='fixed bottom-0 left-0 right-0 border-t bg-white py-2 md:hidden'>
      <div className='flex justify-around'>
        <Link
          to='#'
          className='flex flex-col items-center text-xs text-purple-700'
        >
          <div className='flex h-6 w-6 items-center justify-center'>
            <span>📦</span>
          </div>
          <span>Plan</span>
        </Link>
        <Link to='#' className='flex flex-col items-center text-xs'>
          <div className='flex h-6 w-6 items-center justify-center'>
            <span>⚙️</span>
          </div>
          <span>Output</span>
        </Link>
        <button
          onClick={onMenuClick}
          className='flex flex-col items-center focus:outline-none'
        >
          <div className='text-s -mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-700 text-white'>
            <Grid className='h-5 w-5' />
          </div>
          <span>Main Menu</span>
        </button>

        <Link to='#' className='flex flex-col items-center text-xs'>
          <div className='flex h-6 w-6 items-center justify-center'>
            <span>❌</span>
          </div>
          <span>Defect</span>
        </Link>
        <Link to='#' className='flex flex-col items-center text-xs'>
          <div className='flex h-6 w-6 items-center justify-center'>
            <span>👤</span>
          </div>
          <span>Profile</span>
        </Link>
      </div>
    </div>
  )
}
