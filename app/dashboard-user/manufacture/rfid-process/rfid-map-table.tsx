'use client'

import { useState } from 'react'
import { RefreshCw, Send, Edit2, Check, X, Loader2, Radio } from 'lucide-react'
import type { RfidMapItem } from '@/services/rfidApi'
import { STATIONS } from './constants'

interface RfidMapTableProps {
  items: RfidMapItem[]
  isLoading: boolean
  selectedStation: string
  onStationChange: (station: string) => void
  onRefresh: () => void
  onTriggerCommand: (command: 'READ' | 'WRITE') => void
  onSaveValue: (fid: number, value: string | null) => void
}

export function RfidMapTable({
  items,
  isLoading,
  selectedStation,
  onStationChange,
  onRefresh,
  onTriggerCommand,
  onSaveValue,
}: RfidMapTableProps) {
  const [editingFid, setEditingFid] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [triggeringCmd, setTriggeringCmd] = useState<'READ' | 'WRITE' | null>(null)

  const handleTrigger = async (command: 'READ' | 'WRITE') => {
    if (selectedStation === 'ALL') return
    setTriggeringCmd(command)
    await onTriggerCommand(command)
    setTriggeringCmd(null)
  }

  const startEdit = (item: RfidMapItem) => {
    setEditingFid(item.FID)
    setEditValue(item.VALUE_ASCII ?? '')
  }

  const saveEdit = async () => {
    if (editingFid === null) return
    await onSaveValue(editingFid, editValue || null)
    setEditingFid(null)
    setEditValue('')
  }

  const triggerDisabled = selectedStation === 'ALL' || triggeringCmd !== null

  return (
    <div className='flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col'>
      {/* Table header: title, filter, refresh, trigger buttons */}
      <div className='p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3'>
        <span className='flex items-center gap-2 text-sm font-bold text-slate-800 tracking-wider'>
          <Radio className='h-4 w-4 text-blue-600' />
          Mapping RFID ({items.length} records)
        </span>

        <div className='flex flex-wrap items-center gap-3'>
          {/* Station filter + refresh */}
          <div className='flex items-center gap-2'>
            <label className='text-sm font-semibold text-slate-700'>Station Filter:</label>
            <select
              value={selectedStation}
              onChange={(e) => onStationChange(e.target.value)}
              className='px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              {STATIONS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className='flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold shadow transition-all disabled:opacity-50'
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Trigger buttons */}
          <div className='flex items-center gap-2 border-l border-slate-300 pl-3'>
            <button
              onClick={() => handleTrigger('READ')}
              disabled={triggerDisabled}
              className='flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-sm font-bold shadow transition-all'
              title='Trigger READ command for selected station'
            >
              {triggeringCmd === 'READ' ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
              Trigger READ
            </button>
            <button
              onClick={() => handleTrigger('WRITE')}
              disabled={triggerDisabled}
              className='flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-sm font-bold shadow transition-all'
              title='Trigger WRITE command for selected station'
            >
              {triggeringCmd === 'WRITE' ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
              Trigger WRITE
            </button>
          </div>
        </div>
      </div>

      {/* Table body */}
      <div className='flex-1 overflow-auto relative'>
        {isLoading && items.length > 0 && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]'>
            <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-lg border border-slate-200'>
              <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
              <span className='text-sm font-bold text-slate-700'>Loading data...</span>
            </div>
          </div>
        )}

        {isLoading && items.length === 0 ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
          </div>
        ) : (
          <table className='w-full text-left border-collapse text-sm'>
            <thead>
              <tr className='bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-sm uppercase'>
                <th className='p-3'>FID</th>
                <th className='p-3'>Station</th>
                <th className='p-3'>Field Name</th>
                <th className='p-3'>Value (ASCII)</th>
                <th className='p-3'>Read Time</th>
                <th className='p-3'>Write Time</th>
                <th className='p-3 text-center'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200'>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-8 text-slate-400 font-medium'>
                    No RFID mapping data found
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isEditing = editingFid === item.FID
                  return (
                    <tr key={item.FID} className='hover:bg-slate-50 transition-colors'>
                      <td className='p-3 font-mono text-sm text-slate-500'>{item.FID}</td>
                      <td className='p-3 font-semibold text-sm text-slate-800'>{item.STATION_NAME}</td>
                      <td className='p-3 font-medium text-sm text-slate-700'>{item.FIELD_NAME}</td>
                      <td className='p-3'>
                        {isEditing ? (
                          <input
                            type='text'
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className='px-2 py-1.5 border border-blue-400 rounded text-sm w-full font-mono focus:outline-none focus:ring-1 focus:ring-blue-500'
                            autoFocus
                          />
                        ) : (
                          <span className='font-mono text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200'>
                            {item.VALUE_ASCII ?? '(null)'}
                          </span>
                        )}
                      </td>
                      <td className='p-3 text-sm text-slate-600 font-mono'>
                        {item.READ_TIME ?? '-'}
                      </td>
                      <td className='p-3 text-sm text-slate-600 font-mono'>
                        {item.WRITE_TIME ?? '-'}
                      </td>
                      <td className='p-3 text-center'>
                        {isEditing ? (
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              onClick={saveEdit}
                              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all'
                              title='Save'
                            >
                              <Check className='h-4 w-4' />
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingFid(null); setEditValue('') }}
                              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold transition-all'
                              title='Cancel'
                            >
                              <X className='h-4 w-4' />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold border border-blue-200 transition-all'
                            title='Edit Value'
                          >
                            <Edit2 className='h-4 w-4' />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}