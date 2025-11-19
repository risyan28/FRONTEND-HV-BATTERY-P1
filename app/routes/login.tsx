import type { Route } from './+types/root'
import { LoginPage } from '@/login'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Login Page' }]
}

export default function Login() {
  return <LoginPage />
}
