// hooks/useSummaryListener.ts
import { useEffect, useState } from 'react'
import { getSocket, subscribeRoom, unsubscribeRoom } from '@/lib/socket'
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
    // subscribeRoom: daftar ke room + otomatis re-subscribe+sync saat reconnect
    subscribeRoom('summary')

    const handleUpdate = (incoming: SummaryData) => setData(incoming)
    socket.on('summary:update', handleUpdate)

    return () => {
      socket.off('summary:update', handleUpdate)
      unsubscribeRoom('summary')
    }
  }, [])

  return { dataSummary }
}
