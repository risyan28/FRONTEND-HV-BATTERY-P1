import type { Route } from './+types/root'
import { DashboardLayout } from '@/dashboard-user/manufacture/layout'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Dashboard' },
    { name: 'description', content: 'Welcome to Dashboard!' },
  ]
}

export default function DashboardUser() {
  return <DashboardLayout />
}
