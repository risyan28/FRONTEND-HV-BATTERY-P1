import type { Route } from '@/routes/+types/root'
import { TraceabilityData } from '@/dashboard-user/manufacture/traceability-data'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Traceability Data' },
    { name: 'description', content: 'TraceabilityData' },
  ]
}

export default function DashboardUser() {
  return <TraceabilityData />
}
