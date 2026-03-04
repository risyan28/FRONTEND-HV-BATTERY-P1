# 🔔 PWA Notification - Panduan Lengkap

## ✅ Status Implementasi

PWA notification **sudah fully implemented** dan siap pakai!

**File yang dibuat:**

- ✅ [app/lib/notifications.ts](app/lib/notifications.ts) - Notification manager
- ✅ [app/components/notification-demo.tsx](app/components/notification-demo.tsx) - Demo component

---

## 🚀 Cara Pakai

### 1. Request Permission (One-time)

```tsx
import { useNotifications } from '@/lib/notifications'

function MyComponent() {
  const { requestPermission, permission } = useNotifications()

  const handleEnable = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      console.log('✅ Notifications enabled!')
    }
  }

  return <button onClick={handleEnable}>Enable Notifications</button>
}
```

### 2. Show Simple Notification

```tsx
import { notificationManager } from '@/lib/notifications'

// Simple notification
await notificationManager.notify(
  'New Order',
  '5 new batteries ready for processing',
)
```

### 3. Production Alert

```tsx
// Production warning
await notificationManager.notifyProductionAlert(
  'Production speed decreased by 15%',
  'warning',
)

// Production error
await notificationManager.notifyProductionAlert(
  'Critical: Line stopped at Station A-01',
  'error',
)
```

### 4. Downtime Alert

```tsx
await notificationManager.notifyDowntime(
  'Station A-01',
  'Battery insertion jammed',
)
```

### 5. Quality Check

```tsx
await notificationManager.notifyQualityCheck(
  'Batch #12345 completed',
  true, // passed
)
```

---

## 🎯 Use Cases Production Real

### Example 1: Socket.IO + Notification

Trigger notification saat ada event dari backend:

```tsx
// app/hooks/use-downtime-socket.ts
import { notificationManager } from '@/lib/notifications'

socket.on('downtime:start', (data) => {
  // Show notification
  notificationManager.notifyDowntime(data.station, data.reason)

  // Update state
  setDowntime(data)
})
```

### Example 2: Auto-notify Production Threshold

```tsx
// app/hooks/use-production-monitor.ts
useEffect(() => {
  if (productionSpeed < 80) {
    notificationManager.notifyProductionAlert(
      `Production speed: ${productionSpeed}%`,
      productionSpeed < 50 ? 'error' : 'warning',
    )
  }
}, [productionSpeed])
```

### Example 3: Quality Fail Alert

```tsx
// app/components/quality-check.tsx
const handleQualityCheck = async (result) => {
  if (!result.passed) {
    await notificationManager.notifyQualityCheck(
      `Battery ${result.serialNumber} failed inspection`,
      false,
    )
  }
}
```

---

## 📱 Demo Component

Tambahkan di dashboard untuk test:

```tsx
// app/routes/dashboard-master.tsx
import { NotificationDemo } from '@/components/notification-demo'

export default function Dashboard() {
  return (
    <div>
      {/* Your dashboard content */}

      {/* Demo component - bisa dihapus di production */}
      <NotificationDemo />
    </div>
  )
}
```

---

## 🔧 Notification Features

### ✅ Yang Sudah Ada:

- ✅ **Permission management** - Request & check permission
- ✅ **Simple notifications** - Title + body
- ✅ **Icon support** - Custom icon per notification
- ✅ **Badge** - Small icon di notification bar
- ✅ **Image** - Large image dalam notification
- ✅ **Vibration** - Haptic feedback (mobile)
- ✅ **Actions** - Tombol "View" / "Dismiss"
- ✅ **Tag system** - Group notifications
- ✅ **Auto-close** - Close by tag
- ✅ **Persistence** - `requireInteraction` untuk critical alerts

### 📋 Notification Types:

| Type         | Icon            | Vibration | Persistent |
| ------------ | --------------- | --------- | ---------- |
| **Info**     | admin-panel.png | 200ms x2  | No         |
| **Warning**  | maintenance.png | 200ms x2  | No         |
| **Error**    | andon.png       | 300ms x3  | Yes        |
| **Downtime** | maintenance.png | 500ms x2  | Yes        |
| **Quality**  | process.png     | 200ms x2  | Fail only  |

---

## 🌐 Browser Support

| Browser | Desktop      | Mobile | Actions    | Vibrate |
| ------- | ------------ | ------ | ---------- | ------- |
| Chrome  | ✅           | ✅     | ✅         | ✅      |
| Edge    | ✅           | ✅     | ✅         | ✅      |
| Firefox | ✅           | ✅     | ⚠️ Limited | ✅      |
| Safari  | ⚠️ macOS 13+ | ❌     | ❌         | ❌      |

**Note:** Safari iOS tidak support web notifications. Alternative: pakai native app wrapper (Capacitor/Cordova)

---

## 🧪 Test Notification

### Desktop (Chrome):

1. **Buka:** `http://localhost:5173`
2. **Tambahkan `<NotificationDemo />`** di dashboard
3. **Klik:** "Enable Notifications"
4. **Allow permission** di popup
5. **Klik tombol test** → Notification muncul ✅

### Mobile (Chrome Android):

1. **Buka:** `https://your-app.vercel.app` (butuh HTTPS)
2. **Enable notifications**
3. **Lock screen HP**
4. **Trigger notification** → Muncul di notification bar ✅

### Background Notification:

1. **Enable notification**
2. **Minimize/switch tab**
3. **Trigger notification** dari backend/timer
4. **Notification muncul** bahkan app tertutup ✅

---

## 🔐 Permission Best Practices

### ❌ Jangan:

```tsx
// Langsung request tanpa context
useEffect(() => {
  requestPermission() // Ini akan ditolak user
}, [])
```

### ✅ Do:

```tsx
// Request setelah user action
<button onClick={requestPermission}>Get notified for production alerts</button>
```

### ⭐ Best:

```tsx
// Show value proposition dulu
{
  permission === 'default' && (
    <div className='notification-prompt'>
      <p>Enable notifications to get real-time alerts for:</p>
      <ul>
        <li>Production downtime</li>
        <li>Quality issues</li>
        <li>Maintenance schedules</li>
      </ul>
      <button onClick={requestPermission}>Enable</button>
    </div>
  )
}
```

---

## 🎨 Customize Notifications

### Custom Icon per Notification:

```tsx
await notificationManager.showNotification({
  title: 'Custom Alert',
  body: 'Your message here',
  icon: '/images/custom-icon.png',
  badge: '/images/badge.png',
  image: '/images/detail-image.png',
})
```

### With Action Buttons:

```tsx
await notificationManager.showNotification({
  title: 'Downtime Alert',
  body: 'Station A-01 stopped',
  actions: [
    { action: 'view', title: 'View Details', icon: '/images/view.png' },
    { action: 'acknowledge', title: 'Acknowledge' },
    { action: 'escalate', title: 'Escalate' },
  ],
})
```

### Silent Notification:

```tsx
await notificationManager.showNotification({
  title: 'Background Update',
  body: 'Data synced',
  silent: true,
  vibrate: [],
})
```

---

## 🚨 Handle Notification Click

Tambahkan di service worker (auto-generated Workbox):

```typescript
// vite.config.ts
VitePWA({
  workbox: {
    // ... existing config
    // Handle notification click
    // Note: Workbox handles this automatically
  },
})
```

User klik notification → App terbuka otomatis ✅

---

## 📊 Notification Analytics

Track notification engagement:

```tsx
await notificationManager.showNotification({
  title: 'Production Alert',
  body: 'Speed decreased',
  data: {
    trackingId: 'prod-alert-001',
    timestamp: Date.now(),
    severity: 'warning',
  },
})

// Service worker akan receive data ini saat user click
```

---

## 🎉 Summary

✅ **Notification sudah ready dipakai**  
✅ **Support desktop & mobile (Chrome/Edge)**  
✅ **4 preset types:** info, warning, error, downtime  
✅ **Custom notifications** dengan full control  
✅ **Auto permission management**  
✅ **React hooks** untuk easy integration

**Next Step:**

1. Tambahkan `<NotificationDemo />` di dashboard
2. Test permission & notifications
3. Integrate dengan Socket.IO events
4. Deploy ke production (HTTPS) untuk mobile test

**Files:**

- Implementation: [app/lib/notifications.ts](app/lib/notifications.ts)
- Demo: [app/components/notification-demo.tsx](app/components/notification-demo.tsx)
- Docs: You're reading it! 📖
