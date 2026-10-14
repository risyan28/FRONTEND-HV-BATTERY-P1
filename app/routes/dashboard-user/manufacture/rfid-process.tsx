import type { Route } from '@/routes/+types/root'
import { RfidProcessPage } from '@/dashboard-user/manufacture/rfid-process'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'RFID Process Control - HEV Battery' },
    { name: 'description', content: 'Manual RFID Read/Write Process Control' },
  ]
}

export default function RfidRoute() {
  return <RfidProcessPage />
}
