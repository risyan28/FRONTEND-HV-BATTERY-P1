// hooks/useSummaryListener.ts
import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket' // ❌ closeSocket tidak perlu di-import
import type { SummaryData } from '@/types/summary'

export function useSummaryListener() {
  const [dataSummary, setData] = useState<SummaryData>({
    Target: 0,
    Plan: 0,
    ActCkd: 0,
    ActAssy: 0,
    Eff: 0,
    TaktTime: 0,
  })

  

  useEffect(() => {
    const socket = getSocket()

    // 📥 Subscribe ke data 'summary'
    socket.emit('subscribe', 'summary')
    const handleUpdate = (incoming: SummaryData) => setData(incoming)
    socket.on('summary:update', handleUpdate)

    return () => {
      // Hanya cleanup listener data — bukan koneksi
      socket.off('summary:update', handleUpdate)
      // 📤 Unsubscribe saat unmount
      socket.emit('unsubscribe', 'summary')
    }
  }, [])

  return { dataSummary }
}
