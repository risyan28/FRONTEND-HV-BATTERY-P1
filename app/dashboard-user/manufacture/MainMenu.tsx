'use client'

import { RealtimeStats } from '@/components/manufacture/dashboard/RealtimeStats'
import { QuickAccess } from '@/components/manufacture/dashboard/QuickAccess'
import { useSummaryListener } from '@/hooks/use-summary-socket'
import { useDowntimeListener } from '@/hooks/use-downtime-socket'

export function MainMenu() {
  const { dataSummary } = useSummaryListener()
  const { downtimeData } = useDowntimeListener()

  return (
    <div className='container mx-auto px-4 py-4'>
      <RealtimeStats
        target={dataSummary.Target}
        plan={dataSummary.Plan}
        actual={dataSummary.ActCkd + dataSummary.ActAssy}
        effPct={dataSummary.Eff}
        downtime={downtimeData.reduce((sum, d) => sum + d.minutes, 0)}
      />
      <QuickAccess />
    </div>
  )
}
