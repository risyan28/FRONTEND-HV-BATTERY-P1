// hooks/useMenuItems.ts
import { RefreshCw, Cog } from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
  icon: LucideIcon | string
  label: string
  href: string
  children?: MenuItem[]
}

export function useMenuItems(): MenuItem[] {
  return [
    {
      icon: '/images/admin-panel.png',
      label: 'Sequence Control',
      href: '/dashboard-user/manufacture/production-plan',
      children: [],
    },
    {
      icon: '/images/pc.png',
      label: 'Realtime Sequence',
      href: '/dashboard-user/manufacture/sequence-monitor',
      children: [],
    },
    {
      icon: '/images/andon.png',
      label: 'Andon Screen',
      href: '/dashboard-user/manufacture/andon-screen',
      children: [],
    },
    {
      icon: '/images/printer.png',
      label: 'History Printing',
      href: '/dashboard-user/manufacture/history-print',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'Defect Rate',
      href: '/dashboard-user/manufacture/defect-rate',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'Preventive Maintenance',
      href: '/dashboard-user/manufacture/preventive-maintenance',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'Shift Schedule',
      href: '/dashboard-user/manufacture/shift-schedule',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'Andon History',
      href: '/dashboard-user/manufacture/andon-history',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'Quality Check',
      href: '/dashboard-user/manufacture/quality-check',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'Line Performance',
      href: '/dashboard-user/manufacture/line-performance',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'Work Order',
      href: '/dashboard-user/manufacture/work-order',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'My Profile',
      href: '/dashboard-user/manufacture/my-profile',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'Data Master',
      href: '/dashboard-master',
      children: [],
    },
    {
      icon: RefreshCw,
      label: 'Logout',
      href: '/',
      children: [],
    },
  ]
}
