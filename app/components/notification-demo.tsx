/**
 * Example: Notification Component
 * Demo component to test PWA notifications
 */

import { useState } from 'react'
import { useNotifications } from '@/lib/notifications'
import { Button } from '@/components/ui/button'

export function NotificationDemo() {
  const {
    isSupported,
    permission,
    requestPermission,
    notify,
    notifyProductionAlert,
    notifyDowntime,
  } = useNotifications()
  const [permissionStatus, setPermissionStatus] = useState(permission)

  const handleRequestPermission = async () => {
    const result = await requestPermission()
    setPermissionStatus(result)
  }

  const handleTestNotification = async () => {
    await notify(
      'Test Notification',
      'This is a test notification from HV Battery P1',
    )
  }

  const handleProductionAlert = async () => {
    await notifyProductionAlert(
      'Production line speed decreased by 15%',
      'warning',
    )
  }

  const handleDowntimeAlert = async () => {
    await notifyDowntime('Station A-01', 'Battery insertion jammed')
  }

  if (!isSupported) {
    return (
      <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
        <p className='text-yellow-800'>
          Notifications not supported in this browser
        </p>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-4 border rounded-lg'>
      <h3 className='text-lg font-bold'>PWA Notifications Demo</h3>

      <div className='space-y-2'>
        <p className='text-sm'>
          Permission Status:{' '}
          <span className='font-semibold'>{permissionStatus}</span>
        </p>

        {permissionStatus === 'default' && (
          <Button onClick={handleRequestPermission} variant='default'>
            🔔 Enable Notifications
          </Button>
        )}

        {permissionStatus === 'granted' && (
          <div className='space-y-2'>
            <p className='text-sm text-green-600'>✅ Notifications enabled</p>
            <div className='flex flex-wrap gap-2'>
              <Button onClick={handleTestNotification} size='sm'>
                Test Notification
              </Button>
              <Button
                onClick={handleProductionAlert}
                size='sm'
                variant='outline'
              >
                ⚠️ Production Alert
              </Button>
              <Button
                onClick={handleDowntimeAlert}
                size='sm'
                variant='destructive'
              >
                🔴 Downtime Alert
              </Button>
            </div>
          </div>
        )}

        {permissionStatus === 'denied' && (
          <div className='p-3 bg-red-50 border border-red-200 rounded'>
            <p className='text-sm text-red-800'>
              ❌ Notifications blocked. Enable in browser settings:
              <br />
              Chrome: Settings → Privacy → Site Settings → Notifications
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
