import type { Route } from '@/routes/+types/root'
import { ManBracketPage } from '@/dashboard-user/manufacture/man-bracket'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Man Bracket Screen' },
    { name: 'description', content: 'Man Bracket Screen' },
  ]
}

export default function DashboardUser() {
  return <ManBracketPage />
}
