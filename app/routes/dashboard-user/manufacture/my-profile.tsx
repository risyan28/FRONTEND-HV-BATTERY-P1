import type { Route } from '@/routes/+types/root'
import { MyProfilePage } from '@/dashboard-user/manufacture/my-profile'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function DashboardUser() {
  return <MyProfilePage />
}
