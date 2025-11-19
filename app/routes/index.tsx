import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkBackendConnection } from '@/lib/api'
import { getSocket, closeSocket } from '@/lib/socket'
import { AlertCircle, WifiOff, Server, RefreshCw } from 'lucide-react'

type SystemStatus = {
  http: 'loading' | 'online' | 'offline'
  ws: 'loading' | 'online' | 'offline'
}

// 🔌 Helper: tunggu koneksi WebSocket dengan timeout
function waitForSocketConnection(
  socket: any,
  timeoutMs = 3000
): Promise<boolean> {
  return new Promise((resolve) => {
    if (socket.connected) {
      return resolve(true)
    }

    const onConnect = () => {
      cleanup()
      resolve(true)
    }

    const onConnectError = () => {
      cleanup()
      resolve(false)
    }

    const cleanup = () => {
      clearTimeout(timerId)
      socket.off('connect', onConnect)
      socket.off('connect_error', onConnectError)
    }

    const timerId = setTimeout(() => {
      cleanup()
      resolve(false)
    }, timeoutMs)

    socket.once('connect', onConnect)
    socket.once('connect_error', onConnectError)
  })
}

export default function Index() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<SystemStatus>({
    http: 'loading',
    ws: 'loading',
  })

  const checkHealth = async () => {
    setStatus({ http: 'loading', ws: 'loading' })

    // 1. Cek HTTP backend
    const httpResult = await checkBackendConnection()
    const isHttpOnline = httpResult.connected

    // 2. Cek WebSocket hanya jika HTTP online
    let isWsOnline = false
    if (isHttpOnline) {
      try {
        const socket = getSocket() // ← init & connect (singleton)
        isWsOnline = await waitForSocketConnection(socket, 3000)
      } catch (err) {
        console.error('WebSocket check failed:', err)
        isWsOnline = false
      }
    }

    // Update status UI
    const newStatus: SystemStatus = {
      http: isHttpOnline ? 'online' : 'offline',
      ws: isWsOnline ? 'online' : 'offline',
    }
    setStatus(newStatus)

    // Tutup koneksi global jika salah satu gagal
    if (!isHttpOnline || !isWsOnline) {
      closeSocket()
    }

    // Redirect hanya jika keduanya online
    if (isHttpOnline && isWsOnline) {
      navigate('/dashboard-user/manufacture', { replace: true })
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const isAllOnline = status.http === 'online' && status.ws === 'online'
  const isLoading = status.http === 'loading' || status.ws === 'loading'

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[220px] text-center'>
        <p className='text-gray-600'>
          🔄 Mengecek koneksi ke backend dan WebSocket...
        </p>
      </div>
    )
  }

  if (!isAllOnline) {
    return (
      <div className='max-w-2xl mx-auto w-full px-4 py-6'>
        <div className='flex flex-col items-center justify-center min-h-[280px] text-center space-y-6'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto' />
          <div className='space-y-2'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Sistem Belum Siap
            </h3>
            <p className='text-gray-600 max-w-md'>
              Pastikan semua service berjalan, lalu coba lagi.
            </p>
          </div>

          {/* Status HTTP */}
          <div className='flex items-center gap-2 text-sm'>
            {status.http === 'online' ? (
              <span className='h-2 w-2 rounded-full bg-green-500' />
            ) : (
              <Server className='h-4 w-4 text-red-500' />
            )}
            <span>
              Backend HTTP:{' '}
              <span
                className={
                  status.http === 'online' ? 'text-green-600' : 'text-red-500'
                }
              >
                {status.http === 'online' ? 'Online' : 'Offline'}
              </span>
            </span>
          </div>

          {/* Status WebSocket */}
          <div className='flex items-center gap-2 text-sm'>
            {status.ws === 'online' ? (
              <span className='h-2 w-2 rounded-full bg-green-500' />
            ) : (
              <WifiOff className='h-4 w-4 text-red-500' />
            )}
            <span>
              WebSocket:{' '}
              <span
                className={
                  status.ws === 'online' ? 'text-green-600' : 'text-red-500'
                }
              >
                {status.ws === 'online' ? 'Online' : 'Offline'}
              </span>
            </span>
          </div>

          <button
            onClick={checkHealth}
            className='inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-white hover:bg-gray-800 mt-4'
          >
            <RefreshCw className='h-4 w-4' /> Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return null
}
