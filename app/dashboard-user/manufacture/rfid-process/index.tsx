'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/production/page-header'
import { rfidApi, type RfidMapItem } from '@/services/rfidApi'
import { RfidMapTable } from './rfid-map-table'

export function RfidProcessPage() {
  const [selectedStation, setSelectedStation] = useState<string>('ALL')
  const [items, setItems] = useState<RfidMapItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const station = selectedStation === 'ALL' ? undefined : selectedStation
      const data = await rfidApi.getMap(station)
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch RFID data')
    } finally {
      setIsLoading(false)
    }
  }, [selectedStation])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleTrigger = async (command: 'READ' | 'WRITE') => {
    try {
      await rfidApi.triggerCommand(selectedStation, command)
      toast.success(`Triggered ${command} command for ${selectedStation}`)
      setTimeout(() => loadData(), 1500)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Command failed')
    }
  }

  const handleSaveValue = async (fid: number, value: string | null) => {
    try {
      await rfidApi.updateValue(fid, value)
      toast.success('RFID value updated successfully')
      loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  return (
    <div className='h-screen flex flex-col bg-slate-50'>
      <div className='flex-shrink-0 px-2 md:px-6 py-2 md:py-4 pb-2'>
        <PageHeader
          isLoading={isLoading && items.length === 0}
          title='RFID Process'
        />
      </div>

      <div className='flex-1 min-h-0 flex flex-col px-2 md:px-6 gap-4 overflow-auto pb-4'>
        {error && (
          <div className='p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium flex items-center gap-2'>
            <AlertTriangle className='h-4 w-4 shrink-0' />
            {error}
          </div>
        )}

        <RfidMapTable
          items={items}
          isLoading={isLoading}
          selectedStation={selectedStation}
          onStationChange={setSelectedStation}
          onRefresh={loadData}
          onTriggerCommand={handleTrigger}
          onSaveValue={handleSaveValue}
        />
      </div>
    </div>
  )
}