import type { Route } from '@/routes/+types/root'
import { ProductionControlPage } from '@/dashboard-user/manufacture/production-control'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Production Control Planning' },
    {
      name: 'description',
      content: 'Production Control Planning — HV Battery Line',
    },
  ]
}

export default function ProductionControlRoute() {
  return <ProductionControlPage />
}
