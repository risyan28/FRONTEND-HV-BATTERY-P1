import type { Route } from '@/routes/+types/root'
import { ProductionPlanPage } from '@/dashboard-user/manufacture/production-plan'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Control Sequence' },
    { name: 'description', content: 'Control Sequence!' },
  ]
}

export default function DashboardUser() {
  return <ProductionPlanPage />
}
