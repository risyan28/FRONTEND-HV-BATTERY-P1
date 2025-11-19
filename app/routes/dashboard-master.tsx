import type { Route } from '@/routes/+types/root'
import { DashboardMaster } from '@/dashboard-master'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Dashboard Master' },
    { name: 'description', content: 'Welcome to Dashboard Master!' },
  ]
}

export default function DashboardUser() {
  return <DashboardMaster />
}
