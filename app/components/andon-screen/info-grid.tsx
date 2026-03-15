// components/InfoGrid.tsx
import React, { useState, useEffect } from 'react'

type CallStatus = {
  station: string
  call_type: 'LEADER' | 'MTN'
}

type InfoGridProps = {
  className?: string
  activeCalls: CallStatus[]
  isLandscape?: boolean
}

export function InfoGrid({
  className = '',
  activeCalls,
  isLandscape = false,
}: InfoGridProps) {
  const totalRows = 4

  const [tick, setTick] = useState(0)
  const [callStartTimes, setCallStartTimes] = useState<Record<string, number>>(
    {},
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
      className={`border-4 border-(--color-line-black) bg-white rounded-md flex flex-col ${isLandscape ? 'h-full' : ''} ${className}`}
    >
      <h2
        className={`text-center font-bold uppercase border-b-3 border-(--color-line-black) ${
          isLandscape ? 'py-1 text-5xl' : 'py-1 text-4xl'
        } bg-gray-300`}
      >
        INFORMATION
      </h2>
      {/* 👇 Tetapkan tinggi total grid = 4 baris × tinggi per baris */}
      <div
        className={`grid grid-cols-3 flex-1 overflow-hidden ${
          isLandscape ? 'gap-1 p-1' : 'gap-2 p-2'
        }`}
        style={{
          gridAutoRows: isLandscape ? '1fr' : '95px',
          minHeight: isLandscape ? 'auto' : '350px',
        }}
      >
        {Array.from({ length: totalRows }).map((_, rowIndex) => {
          const call = sortedActiveCalls[rowIndex] || null
          const id = call ? getCallId(call) : `empty-${rowIndex}`
          const startTime = call ? callStartTimes[getCallId(call)] : null
          const bgColor = getBgColor(call?.call_type || null)

          return (
            <React.Fragment key={id}>
              {/* Station */}
              <div
                className='border-3 border-(--color-line-black) p-1 flex items-center justify-center text-center font-bold overflow-hidden'
                style={{
                  backgroundColor: bgColor,
                  fontSize: isLandscape ? '30px' : '18px',
                  lineHeight: '1.3',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                {call ? (
                  <span className='text-black'>
                    {call.station === 'UN LOADING'
                      ? 'MODULE INSPECT'
                      : call.station}
                  </span>
                ) : (
                  ''
                )}
              </div>

              {/* Icon */}
              <div
                className='border-3 border-(--color-line-black) p-1 flex items-center justify-center overflow-hidden'
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
                    className={
                      isLandscape
                        ? 'w-18 h-18 object-contain'
                        : 'w-20 h-20 object-contain'
                    }
                  />
                ) : null}
              </div>

              {/* Timer */}
              <div
                className='border-3 border-(--color-line-black) p-1 flex flex-col items-center justify-center text-center overflow-hidden'
                style={{ backgroundColor: bgColor }}
              >
                {call && startTime != null ? (
                  <>
                    <div
                      className={`text-black font-bold leading-tight ${
                        isLandscape ? 'text-[16px]' : 'text-[16px]'
                      }`}
                    >
                      [Delayed]
                    </div>
                    <div
                      className={`font-bold text-black leading-none ${
                        isLandscape ? 'text-4xl' : 'text-5xl'
                      }`}
                    >
                      {getMinutesForCall(startTime)}
                    </div>
                    <div
                      className={`text-black font-bold leading-tight ${
                        isLandscape ? 'text-[16px]' : 'text-[16px]'
                      }`}
                    >
                      [Minutes]
                    </div>
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
