import { io, Socket } from 'socket.io-client'
import logger from './logger'

/**
 * Mendapatkan URL WebSocket:
 * - Dev: otomatis ambil dari window.location
 * - Prod: juga otomatis ambil dari hostname Express backend
 */
const getSocketUrl = (): string => {
  // Jika ada override environment variable (opsional)
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }

  // SSR / server-side fallback
  if (typeof window === 'undefined') {
    return 'ws://localhost:4001'
  }

  // Dev mode: sambung langsung ke BE port 4001 dengan hostname yang sama.
  // Bypass Vite proxy karena proxy tidak support WebSocket-only transport.
  if (import.meta.env.DEV) {
    const { protocol, hostname } = window.location
    return `${protocol}//${hostname}:4001` // e.g. http://192.168.1.167:4001
  }

  // Production: sambung langsung ke backend port 4001
  const { protocol, hostname } = window.location
  const wsProtocol = protocol === 'https:' ? 'wss' : 'ws'
  return `${wsProtocol}://${hostname}:4001`
}

// ─── Singleton ───────────────────────────────────────────────────────────────
let socket: Socket | null = null
let isInitialized = false

/**
 * Set room yang sedang aktif di-subscribe.
 * Dikelola oleh subscribeRoom / unsubscribeRoom — bukan hook.
 */
const activeRooms = new Set<string>()

// ─── Auto re-subscribe + sync saat reconnect ──────────────────────────────────
const handleReconnect = () => {
  if (activeRooms.size === 0) return
  logger.info('Socket reconnected — re-subscribing rooms', {
    rooms: [...activeRooms],
  })
  activeRooms.forEach((room) => {
    socket?.emit('subscribe', room)
    socket?.emit('sync', room) // Minta snapshot terbaru langsung dari BE
  })
}

// ─── getSocket ───────────────────────────────────────────────────────────────
export const getSocket = (): Socket => {
  if (!socket) {
    const SOCKET_URL = getSocketUrl()

    socket = io(SOCKET_URL, {
      transports: ['websocket'], // WebSocket only — BE tidak support polling transport
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      forceNew: false,
    })

    if (!isInitialized) {
      socket.on('connect', () => {
        logger.socket.connected(socket?.id || 'unknown')
        handleReconnect() // ← auto re-subscribe + sync semua room aktif
      })

      socket.on('disconnect', (reason) => {
        logger.socket.disconnected(reason, socket?.id)
        if (reason === 'io server disconnect') {
          logger.info('Server forced disconnect — reconnecting manually')
          socket?.connect()
        }
      })

      socket.on('connect_error', (err) => {
        logger.socket.error(err)
      })

      socket.on('reconnect', (attemptNumber) => {
        logger.socket.reconnecting(attemptNumber)
      })

      socket.on('reconnect_attempt', (attemptNumber) => {
        logger.debug('Socket reconnection attempt', { attempt: attemptNumber })
      })

      socket.on('reconnect_error', (err) => {
        logger.socket.error(err)
      })

      socket.on('reconnect_failed', () => {
        logger.error('Socket reconnection failed after all attempts')
      })

      isInitialized = true
    }
  }

  return socket
}

// ─── Room management ─────────────────────────────────────────────────────────

/**
 * Subscribe ke room dan simpan ke activeRooms.
 * Saat socket reconnect, semua activeRooms akan otomatis di-subscribe + sync.
 * Panggil ini dari hooks sebagai pengganti `socket.emit('subscribe', room)`.
 */
export const subscribeRoom = (room: string) => {
  const s = getSocket()
  activeRooms.add(room)
  if (s.connected) {
    s.emit('subscribe', room)
  }
  // Jika belum connected, handleReconnect() akan handle saat 'connect' fires
}

/**
 * Unsubscribe dari room dan hapus dari activeRooms.
 * Panggil ini dari hooks cleanup (return dari useEffect).
 */
export const unsubscribeRoom = (room: string) => {
  const s = getSocket()
  activeRooms.delete(room)
  if (s.connected) {
    s.emit('unsubscribe', room)
  }
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/**
 * Menutup socket dan reset semua state.
 * Hanya panggil saat user logout / app unmount total.
 */
export const closeSocket = () => {
  if (socket) {
    logger.info('Closing socket connection')
    activeRooms.clear()
    socket.disconnect()
    socket = null
    isInitialized = false
  }
}
