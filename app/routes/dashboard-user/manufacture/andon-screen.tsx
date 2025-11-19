import type { Route } from '@/routes/+types/root'
import { AndonScreen } from '@/dashboard-user/manufacture/andon-screen'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Andon Screen' },
    { name: 'description', content: 'Andon Screen' },
  ]
}

export default function DashboardUser() {
  return <AndonScreen />
}
