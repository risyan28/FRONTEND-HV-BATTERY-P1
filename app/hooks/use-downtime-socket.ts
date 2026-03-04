// hooks/use-downtime-socket.ts
import { useEffect, useState } from 'react'
import { getSocket, subscribeRoom, unsubscribeRoom } from '@/lib/socket'
import type { DowntimeData } from '@/types/downtime'
import logger from '@/lib/logger'

export function useDowntimeListener() {
  const [downtimeMap, setDowntimeMap] = useState<
    Record<string, { times: number; minutes: number }>
  >({})

  useEffect(() => {
    const socket = getSocket()
    // subscribeRoom: daftar ke room + otomatis re-subscribe+sync saat reconnect
    subscribeRoom('downtime')

    // ✅ Terima ARRAY dari server
    const handleUpdate = (payload: DowntimeData[]) => {
      // Validasi: pastikan payload adalah array
      if (!Array.isArray(payload)) {
        logger.warn('Expected array but got:', {
          payload,
          type: typeof payload,
        })
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
            logger.warn('Invalid downtime item:', {
              item,
              validKeys: ['station', 'times', 'minutes'],
            })
          }
        })
        return next
      })
    }

    socket.on('downtime:update', handleUpdate)

    return () => {
      socket.off('downtime:update', handleUpdate)
      unsubscribeRoom('downtime')
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
