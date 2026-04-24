'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getJakartaISODate } from '@/lib/datetime'

type Props = { className?: string; fontSize?: string }

export function Clock({ className, fontSize = 'text-2xl' }: Props) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now)
  const date = getJakartaISODate(now)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center font-mono font-bold text-blue-700',
        'tracking-wide leading-tight',
        fontSize,
        'rounded-lg',
        className,
      )}
    >
      {/* Waktu */}
      <div className='text-center'>{time}</div>

      {/* Tanggal */}
      <div className='text-center whitespace-nowrap'>{date}</div>
    </div>
  )
}
