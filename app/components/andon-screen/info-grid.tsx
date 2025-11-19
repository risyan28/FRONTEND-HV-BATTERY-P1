// components/InfoGrid.tsx
import React, { useState, useEffect } from 'react'

type CallStatus = {
  station: string
  call_type: 'LEADER' | 'MTN'
}

type InfoGridProps = {
  className?: string
  activeCalls: CallStatus[]
}

export function InfoGrid({ className = '', activeCalls }: InfoGridProps) {
  const totalRows = 6

  const [tick, setTick] = useState(0)
  const [callStartTimes, setCallStartTimes] = useState<Record<string, number>>(
    {}
  )

  const getCallId = (call: CallStatus) => `${call.station}-${call.call_type}`

  // Sinkronisasi waktu mulai berdasarkan activeCalls
  useEffect(() => {
    setCallStartTimes((prev) => {
      const newStartTimes = { ...prev }

      // Tambahkan waktu untuk panggilan baru
      activeCalls.forEach((call) => {
        const id = getCallId(call)
        if (!(id in newStartTimes)) {
          newStartTimes[id] = Date.now()
        }
      })

      // Hapus yang sudah tidak aktif
      Object.keys(newStartTimes).forEach((id) => {
        const isActive = activeCalls.some((call) => getCallId(call) === id)
        if (!isActive) {
          delete newStartTimes[id]
        }
      })

      return newStartTimes
    })
  }, [activeCalls])

  // Re-render tiap detik untuk update timer
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const getMinutesForCall = (startTime: number) => {
    return Math.floor((Date.now() - startTime) / 60000)
  }

  const getBgColor = (callType: 'LEADER' | 'MTN' | null): string => {
    if (callType === 'LEADER') return '#ffff00' // kuning
    if (callType === 'MTN') return '#ff0000' // merah
    return '#ffffff' // putih
  }

  // Urutkan: terbaru di atas
  const sortedActiveCalls = [...activeCalls].sort((a, b) => {
    const idA = getCallId(a)
    const idB = getCallId(b)
    return (callStartTimes[idB] || 0) - (callStartTimes[idA] || 0)
  })

  return (
    <section
      className={`border-4 border-[var(--color-line-black)] bg-white rounded-md flex flex-col ${className}`}
    >
      <h2 className='text-center font-bold uppercase border-b-3 border-[var(--color-line-black)] py-2 text-3xl bg-gray-300'>
        INFORMATION
      </h2>
      <div className='grid grid-cols-3 grid-rows-6 gap-2 p-2 flex-1'>
        {Array.from({ length: totalRows }).map((_, rowIndex) => {
          const call = sortedActiveCalls[rowIndex] || null
          const id = call ? getCallId(call) : `empty-${rowIndex}`
          const startTime = call ? callStartTimes[getCallId(call)] : null
          const bgColor = getBgColor(call?.call_type || null)

          // ✅ Gunakan React.Fragment dengan key unik per "baris logis"
          return (
            <React.Fragment key={id}>
              {/* Station */}
              <div
                className='border-3 border-[var(--color-line-black)] h-full min-h-20 p-2 flex items-center justify-center text-center text-xl font-bold overflow-hidden'
                style={{ backgroundColor: bgColor }}
              >
                {call ? (
                  <span className='text-black break-words'>{call.station}</span>
                ) : null}
              </div>

              {/* Icon */}
              <div
                className='border-3 border-[var(--color-line-black)] h-full min-h-20 flex items-center justify-center overflow-hidden'
                style={{ backgroundColor: bgColor }}
              >
                {call ? (
                  <img
                    src={
                      call.call_type === 'LEADER'
                        ? '/images/leader.png'
                        : '/images/maintenance.png'
                    }
                    alt={call.call_type}
                    className='w-18 h-18 object-contain'
                  />
                ) : null}
              </div>

              {/* Timer */}
              <div
                className='border-3 border-[var(--color-line-black)] h-full min-h-20 p-2 flex flex-col items-center justify-center text-center overflow-hidden'
                style={{ backgroundColor: bgColor }}
              >
                {call && startTime != null ? (
                  <>
                    <div className='text-xs text-black'>[Delayed]</div>
                    <div className='text-4xl font-bold text-black'>
                      {getMinutesForCall(startTime)}
                    </div>
                    <div className='text-xs text-black'>[Minutes]</div>
                  </>
                ) : null}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </section>
  )
}
