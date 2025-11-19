import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
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

    // 📥 Subscribe ke data 'sequences'
    socket.emit('subscribe', 'sequences')
    const handleUpdate = (payload: SequenceState) => setSequences(payload)
    socket.on('sequences:update', handleUpdate)

    return () => {
      socket.off('sequences:update', handleUpdate)
      // 📤 Unsubscribe saat unmount
      socket.emit('unsubscribe', 'sequences')
    }
  }, [])

  return { sequences, connected }
}
