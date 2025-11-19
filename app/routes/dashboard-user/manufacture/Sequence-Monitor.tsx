import type { Route } from '@/routes/+types/root'
import { ProductionSequencePage } from '@/dashboard-user/manufacture/Sequence-Monitor'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Realtime Sequence' },
    { name: 'description', content: 'Realtime Sequence!' },
  ]
}

export default function DashboardUser() {
  return <ProductionSequencePage />
}
