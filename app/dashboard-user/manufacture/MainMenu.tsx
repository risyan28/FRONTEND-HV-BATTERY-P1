'use client'

import { RealtimeStats } from '@/components/manufacture/dashboard/RealtimeStats'
import { QuickAccess } from '@/components/manufacture/dashboard/QuickAccess'
import { StationConfig } from './station-config'
import { useSummaryListener } from '@/hooks/use-summary-socket'
import { useDowntimeListener } from '@/hooks/use-downtime-socket'

export function MainMenu() {
  const { dataSummary } = useSummaryListener()
  const { downtimeData } = useDowntimeListener()

  return (
    <div className='container mx-auto px-2 py-1'>
      <RealtimeStats
        target={dataSummary.Target}
        plan={dataSummary.Plan}
        actual={dataSummary.ActCkd + dataSummary.ActAssy}
        effPct={dataSummary.Eff}
        downtime={downtimeData.reduce((sum, d) => sum + d.minutes, 0)}
      />
      <StationConfig />
      <QuickAccess />
    </div>
  )
}
