// hooks/use-factory-data.ts
import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'

export type ActiveCall = {
  station: string
  call_type: 'LEADER' | 'MTN'
}

export type ProcessStatus = {
  station: string
  status: string
  source: 'limit_switch' | 'equipment'
}

// ✅ Helper: validasi dan filter data
function isValidActiveCall(item: any): item is ActiveCall {
  return (
    typeof item?.station === 'string' &&
    item.station.trim() !== '' &&
    ['LEADER', 'MTN'].includes(item.call_type)
  )
}

function isValidProcessStatus(item: any): item is ProcessStatus {
  return (
    typeof item?.station === 'string' &&
    item.station.trim() !== '' &&
    typeof item.status === 'string' &&
    ['limit_switch', 'equipment'].includes(item.source)
  )
}

export function useFactoryData() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([])
  const [processStatuses, setProcessStatuses] = useState<ProcessStatus[]>([])

  useEffect(() => {
    const socket = getSocket()

    socket.emit('subscribe', 'calls')
    socket.emit('subscribe', 'processes')

    // ✅ Handle calls dengan validasi
    const handleCallsUpdate = (rawData: any[]) => {
      const validCalls = rawData.filter(isValidActiveCall).map((item) => ({
        station: item.station, // sesuaikan dengan nama kolom BE
        call_type: item.call_type,
      }))
      setActiveCalls(validCalls)
    }

    // ✅ Handle processes dengan validasi
    const handleProcessesUpdate = (rawData: any[]) => {
      const validProcesses = rawData
        .filter(isValidProcessStatus)
        .map((item) => ({
          station: item.station,
          status: item.status,
          source: item.source,
        }))
      setProcessStatuses(validProcesses)
    }

    socket.on('calls:update', handleCallsUpdate)
    socket.on('processes:update', handleProcessesUpdate)

    return () => {
      socket.off('calls:update', handleCallsUpdate)
      socket.off('processes:update', handleProcessesUpdate)
      socket.emit('unsubscribe', 'calls')
      socket.emit('unsubscribe', 'processes')
    }
  }, [])

  return { activeCalls, processStatuses }
}
