// hooks/use-downtime-socket.ts
import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import type { DowntimeData } from '@/types/downtime'

export function useDowntimeListener() {
  const [downtimeMap, setDowntimeMap] = useState<
    Record<string, { times: number; minutes: number }>
  >({})

  useEffect(() => {
    const socket = getSocket()

    // Pastikan socket valid (jika getSocket bisa return null/undefined)
    if (!socket) return

    socket.emit('subscribe', 'downtime')

    // ✅ Terima ARRAY dari server
    const handleUpdate = (payload: DowntimeData[]) => {
      // Validasi: pastikan payload adalah array
      if (!Array.isArray(payload)) {
        console.warn('Expected array but got:', payload)
        return
      }

      setDowntimeMap((prev) => {
        const next = { ...prev }
        payload.forEach((item) => {
          // Validasi tiap item
          if (
            typeof item.station === 'string' &&
            typeof item.times === 'number' &&
            typeof item.minutes === 'number' &&
            item.times >= 0 &&
            item.minutes >= 0
          ) {
            next[item.station] = { times: item.times, minutes: item.minutes }
          } else {
            console.warn('Invalid downtime item:', item)
          }
        })
        return next
      })
    }

    socket.on('downtime:update', handleUpdate)

    return () => {
      socket.off('downtime:update', handleUpdate)
      socket.emit('unsubscribe', 'downtime')
    }
  }, [])

  // Konversi ke array — urutan tidak dijamin, tapi konsisten per render
  const downtimeData = Object.entries(downtimeMap).map(([station, data]) => ({
    station,
    times: data.times,
    minutes: data.minutes,
  }))

  return { downtimeData }
}
