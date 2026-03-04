import { useEffect, useState } from 'react'
import { getSocket, subscribeRoom, unsubscribeRoom } from '@/lib/socket'
import { useSocketStatus } from './use-socket-status'
import type { SequenceState } from '@/types/sequence'

// opsional: kalau nanti hybrid (delta juga dikirim BE)
type Delta = {
  type: 'insert' | 'update' | 'delete'
  target: keyof SequenceState
  data: any
}

export function useSequenceSocket() {
  const { connected } = useSocketStatus() // ← reuse status
  const [sequences, setSequences] = useState<SequenceState>({
    current: null,
    queue: [],
    completed: [],
    parked: [],
  })

  useEffect(() => {
    const socket = getSocket()
    // subscribeRoom: daftar ke room + otomatis re-subscribe+sync saat reconnect
    subscribeRoom('sequences')

    const handleUpdate = (payload: SequenceState) => setSequences(payload)
    socket.on('sequences:update', handleUpdate)

    return () => {
      socket.off('sequences:update', handleUpdate)
      unsubscribeRoom('sequences')
    }
  }, [])

  return { sequences, connected }
}
