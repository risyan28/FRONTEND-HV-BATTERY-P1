import type { Route } from '@/routes/+types/root'
import { HistoryPrint } from '@/dashboard-user/manufacture/history-print'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'History Printing' },
    { name: 'description', content: 'HistoryPrint' },
  ]
}

export default function DashboardUser() {
  return <HistoryPrint />
}
