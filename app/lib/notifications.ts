/**
 * PWA Notification Manager
 * Handle browser push notifications
 */

import logger from './logger'

type NotificationOptions = {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
}

class NotificationManager {
  private static instance: NotificationManager

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  }

  /**
   * Get current notification permission status
   */
  getPermission(): NotificationPermission {
    return Notification.permission
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      logger.warn('Notifications not supported in this browser')
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      logger.info('Notification permission:', { permission })
      return permission
    } catch (error) {
      logger.error('Failed to request notification permission', { error })
      return 'denied'
    }
  }

  /**
   * Show a notification
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      logger.warn('Notifications not supported')
      return
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
      await this.requestPermission()
    }

    if (Notification.permission !== 'granted') {
      logger.warn('Notification permission denied')
      return
    }

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Show notification via service worker
      // Note: Cast to any to support 'actions' which is not in standard NotificationOptions type
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/images/tmmin.png',
        badge: options.badge || '/images/icon-192.png',
        tag: options.tag || 'default',
        data: options.data,
        actions: options.actions,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
        timestamp: Date.now(),
      } as any)

      logger.info('Notification shown', { title: options.title })
    } catch (error) {
      logger.error('Failed to show notification', { error })
    }
  }

  /**
   * Show notification with default icon
   */
  async notify(title: string, body: string, data?: any): Promise<void> {
    await this.showNotification({
      title,
      body,
      data,
      icon: '/images/tmmin.png',
    })
  }

  /**
   * Show production alert notification
   */
  async notifyProductionAlert(
    message: string,
    severity: 'info' | 'warning' | 'error',
  ): Promise<void> {
    const icons = {
      info: '/images/admin-panel.png',
      warning: '/images/maintenance.png',
      error: '/images/andon.png',
    }

    await this.showNotification({
      title: `Production Alert - ${severity.toUpperCase()}`,
      body: message,
      icon: icons[severity],
      tag: `production-${severity}`,
      requireInteraction: severity === 'error',
      vibrate:
        severity === 'error' ? [300, 100, 300, 100, 300] : [200, 100, 200],
      data: { severity, timestamp: new Date().toISOString() },
    })
  }

  /**
   * Show quality check notification
   */
  async notifyQualityCheck(message: string, passed: boolean): Promise<void> {
    await this.showNotification({
      title: passed ? 'Quality Check Passed ✓' : 'Quality Check Failed ✗',
      body: message,
      icon: '/images/process.png',
      tag: 'quality-check',
      requireInteraction: !passed,
      data: { passed, timestamp: new Date().toISOString() },
    })
  }

  /**
   * Show downtime notification
   */
  async notifyDowntime(station: string, reason: string): Promise<void> {
    await this.showNotification({
      title: `⚠️ Downtime Alert`,
      body: `Station ${station}: ${reason}`,
      icon: '/images/maintenance.png',
      tag: 'downtime',
      requireInteraction: true,
      vibrate: [500, 200, 500],
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      data: { station, reason, timestamp: new Date().toISOString() },
    })
  }

  /**
   * Close all notifications with specific tag
   */
  async closeNotifications(tag: string): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready
      const notifications = await registration.getNotifications({ tag })
      notifications.forEach((notification) => notification.close())
      logger.info('Closed notifications', { tag, count: notifications.length })
    } catch (error) {
      logger.error('Failed to close notifications', { error })
    }
  }
}

export const notificationManager = NotificationManager.getInstance()

/**
 * Hook for using notifications in React components
 */
export function useNotifications() {
  const isSupported = notificationManager.isSupported()
  const permission = notificationManager.getPermission()

  const requestPermission = async () => {
    return await notificationManager.requestPermission()
  }

  const notify = async (title: string, body: string, data?: any) => {
    await notificationManager.notify(title, body, data)
  }

  const notifyProductionAlert = async (
    message: string,
    severity: 'info' | 'warning' | 'error',
  ) => {
    await notificationManager.notifyProductionAlert(message, severity)
  }

  const notifyQualityCheck = async (message: string, passed: boolean) => {
    await notificationManager.notifyQualityCheck(message, passed)
  }

  const notifyDowntime = async (station: string, reason: string) => {
    await notificationManager.notifyDowntime(station, reason)
  }

  return {
    isSupported,
    permission,
    requestPermission,
    notify,
    notifyProductionAlert,
    notifyQualityCheck,
    notifyDowntime,
  }
}
