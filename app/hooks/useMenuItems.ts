// hooks/useMenuItems.ts
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
      icon: '/images/quality-control.png',
      label: 'Production Control Planning',
      href: '/dashboard-user/manufacture/production-control',
      children: [],
    },
    {
      icon: '/images/admin-panel.png',
      label: 'Production Sequence Control',
      href: '/dashboard-user/manufacture/production-plan',
      children: [],
    },
    {
      icon: '/images/printer.png',
      label: 'History Printing',
      href: '/dashboard-user/manufacture/history-print',
      children: [],
    },
    {
      icon: '/images/search.png',
      label: 'Traceability Data',
      href: '/dashboard-user/manufacture/traceability-data',
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
      icon: '/images/man-bracket.png',
      label: 'Man Bracket Screen',
      href: '/dashboard-user/manufacture/man-bracket',
      children: [],
    },
    {
      icon: '/images/data-storage.png',
      label: 'Data Master',
      href: '/dashboard-master',
      children: [],
    },
  ]
}
