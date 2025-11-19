'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = { className?: string }

export function Clock({ className }: Props) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString([], { hour12: false })
  const date = `${String(now.getDate()).padStart(2, '0')}-${
    [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Juni',
      'Juli',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ][now.getMonth()]
  }-${now.getFullYear()}`

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center font-mono font-bold text-blue-700',
        'tracking-wide leading-tight',
        'text-[3vw] md:text-[2.2vw] xl:text-[2.2vw]',
        'rounded-lg', // <-- border radius 5px
        className
      )}
    >
      {/* Waktu */}
      <div className='text-[1em] mb-[0.2em] text-center'>{time}</div>

      {/* Tanggal */}
      <div className='text-[0.8em] text-center whitespace-nowrap'>{date}</div>
    </div>
  )
}
