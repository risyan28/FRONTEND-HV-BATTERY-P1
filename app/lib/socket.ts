import { io, Socket } from "socket.io-client"

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
  if (typeof window === "undefined") {
    // fallback saat dijalankan di Node (SSR / server build)
    return "ws://localhost:4001";
  }

  // Di browser: gunakan hostname dan protocol saat ini
  const { protocol, hostname } = window.location
  const wsProtocol = protocol === "https:" ? "wss" : "ws"
  const port = 4001 // port backend WebSocket
  return `${wsProtocol}://${hostname}:${port}`
}

// Singleton socket instance
let socket: Socket | null = null

/**
 * Mendapatkan instance socket
 */
export const getSocket = (): Socket => {
  if (!socket) {
    const SOCKET_URL = getSocketUrl()

    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socket.on("connect", () => {
      console.log("✅ [Socket] Connected:", socket?.id)
    })

    socket.on("disconnect", (reason) => {
      console.log("❌ [Socket] Disconnected:", reason)
    })

    socket.on("connect_error", (err) => {
      console.error("⚠️ [Socket] Connection Error:", err.message)
    })
  }

  return socket
}

/**
 * Menutup socket
 */
export const closeSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
