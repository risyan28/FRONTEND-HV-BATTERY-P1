/**
 * Quick Start Example - PWA Notifications
 * Copy code ini ke component manapun untuk test notification
 */

import { useEffect } from 'react'
import { useNotifications, notificationManager } from '@/lib/notifications'
import { Button } from '@/components/ui/button'

export function QuickNotificationExample() {
  const { isSupported, permission, requestPermission } = useNotifications()

  // Auto-request permission saat component mount (optional)
  useEffect(() => {
    // Uncomment untuk auto-request (hati-hati, bisa annoying)
    // if (permission === 'default') {
    //   requestPermission()
    // }
  }, [])

  // Example: Listen to socket event dan trigger notification
  useEffect(() => {
    // Contoh integration dengan existing socket
    // const socket = getSocket()
    //
    // socket.on('downtime:start', (data) => {
    //   notificationManager.notifyDowntime(data.station, data.reason)
    // })
    //
    // socket.on('production:alert', (data) => {
    //   notificationManager.notifyProductionAlert(data.message, data.severity)
    // })
    //
    // return () => {
    //   socket.off('downtime:start')
    //   socket.off('production:alert')
    // }
  }, [])

  if (!isSupported) {
    return null // Browser tidak support
  }

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {permission === 'default' && (
        <Button onClick={requestPermission} className='shadow-lg'>
          🔔 Enable Notifications
        </Button>
      )}

      {permission === 'granted' && (
        <Button
          onClick={() => {
            notificationManager.notify('Test', 'Notification working! ✅')
          }}
          variant='outline'
          className='shadow-lg'
        >
          🧪 Test Notification
        </Button>
      )}
    </div>
  )
}

// ===========================================
// EXAMPLE USAGE IN YOUR COMPONENTS
// ===========================================

/*

1. SIMPLE NOTIFICATION
---------------------
import { notificationManager } from '@/lib/notifications'

await notificationManager.notify(
  'Production Complete', 
  '100 batteries processed'
)


2. PRODUCTION ALERT
-------------------
await notificationManager.notifyProductionAlert(
  'Line speed decreased to 75%',
  'warning' // 'info' | 'warning' | 'error'
)


3. DOWNTIME ALERT
-----------------
await notificationManager.notifyDowntime(
  'Station A-01',
  'Battery insertion jammed'
)


4. QUALITY CHECK
----------------
await notificationManager.notifyQualityCheck(
  'Batch #12345 inspection complete',
  true // passed = true/false
)


5. CUSTOM NOTIFICATION
----------------------
await notificationManager.showNotification({
  title: 'Custom Alert',
  body: 'Your custom message here',
  icon: '/images/custom-icon.png',
  badge: '/images/badge.png',
  tag: 'custom-tag',
  requireInteraction: true, // Persistent notification
  vibrate: [200, 100, 200],
  actions: [
    { action: 'view', title: 'View Details' },
    { action: 'dismiss', title: 'Dismiss' }
  ],
  data: {
    // Custom data yang bisa diakses saat user click notification
    orderId: '12345',
    timestamp: Date.now()
  }
})


6. USE IN REACT HOOK
--------------------
import { useNotifications } from '@/lib/notifications'

function MyComponent() {
  const { permission, notify, notifyProductionAlert } = useNotifications()

  const handleAlert = async () => {
    if (permission === 'granted') {
      await notifyProductionAlert('Alert message', 'warning')
    }
  }

  return <button onClick={handleAlert}>Send Alert</button>
}


7. SOCKET.IO INTEGRATION
-------------------------
import { notificationManager } from '@/lib/notifications'
import { getSocket } from '@/lib/socket'

useEffect(() => {
  const socket = getSocket()
  
  socket.on('downtime:start', (data) => {
    notificationManager.notifyDowntime(data.station, data.reason)
  })
  
  socket.on('quality:fail', (data) => {
    notificationManager.notifyQualityCheck(
      `Battery ${data.serialNumber} failed inspection`,
      false
    )
  })
  
  return () => {
    socket.off('downtime:start')
    socket.off('quality:fail')
  }
}, [])


8. CONDITIONAL NOTIFICATION
----------------------------
const checkProductionThreshold = (speed: number) => {
  if (speed < 50) {
    notificationManager.notifyProductionAlert(
      `Critical: Production at ${speed}%`,
      'error'
    )
  } else if (speed < 80) {
    notificationManager.notifyProductionAlert(
      `Warning: Production at ${speed}%`,
      'warning'
    )
  }
}


9. CLOSE NOTIFICATION BY TAG
-----------------------------
// Close semua notification dengan tag tertentu
await notificationManager.closeNotifications('downtime')


10. CHECK PERMISSION BEFORE NOTIFY
-----------------------------------
import { notificationManager } from '@/lib/notifications'

if (notificationManager.getPermission() === 'granted') {
  await notificationManager.notify('Title', 'Body')
} else {
  console.log('Notification permission not granted')
}

*/
