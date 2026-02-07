'use client'

import {
  AbsBox,
  DEFAULT_BOX_HEIGHT,
  DEFAULT_BOX_WIDTH,
  FontSize,
} from './abs-station'
import { type FC } from 'react'

const SPACING = 5

// === TIPE DATA BARU ===
type CallStatus = {
  station: string
  call_type: 'LEADER' | 'MTN'
}

type ProcessStatus = {
  station: string
  status: string
  source: 'limit_switch' | 'equipment'
}

type Props = {
  act_assy: number
  act_ckd: number
  activeCalls: CallStatus[]
  processStatuses: ProcessStatus[] // ✅ tambah ini
}

const normalize = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') return ''
  return name.trim().toUpperCase()
}

// ✅ Fungsi utama: tentukan state akhir per pos
const getProcessPriority = (status: string): number => {
  // Semakin kecil angka, semakin tinggi prioritas
  switch (status) {
    case 'fault':
      return 0
    case 'complete':
      return 1
    case 'process':
      return 2
    case 'start':
      return 3
    case 'auto':
      return 3 // alias untuk 'finish'
    case 'manual':
      return 4
    default:
      return 99
  }
}

const getStationState = (
  station: string,
  activeCalls: CallStatus[],
  processStatuses: ProcessStatus[]
) => {
  const normStation = normalize(station)
  if (!normStation) {
    return { bgColor: '#00ff04', callType: null, isBlinking: false }
  }

  // ✅ PRIORITAS 1: Active Calls (MTN > LEADER)
  const calls = activeCalls.filter((c) => normalize(c.station) === normStation)
  const hasMTN = calls.some((c) => c.call_type === 'MTN')
  const hasLeader = calls.some((c) => c.call_type === 'LEADER')
  const callType = hasMTN ? 'MTN' : hasLeader ? 'LEADER' : null

  if (callType) {
    return callType === 'MTN'
      ? { bgColor: '#ff0000', callType: 'MTN', isBlinking: false }
      : { bgColor: '#ffff00', callType: 'LEADER', isBlinking: false }
  }

  // ✅ PRIORITAS 2: Cari SEMUA status untuk station ini
  const matchingProcesses = processStatuses.filter(
    (p) => normalize(p.station) === normStation
  )

  // Jika tidak ada data proses
  if (matchingProcesses.length === 0) {
    return { bgColor: '#00ff04', callType: null, isBlinking: false }
  }

  // ✅ Ambil status dengan PRIORITAS TERTINGGI
  const bestProcess = matchingProcesses.reduce((prev, current) =>
    getProcessPriority(current.status) < getProcessPriority(prev.status)
      ? current
      : prev
  )

  const { status: procStatus, source } = bestProcess

  // ✅ PRIORITAS 3: Fault → jadi MTN call
  if (procStatus === 'fault') {
    return { bgColor: '#ff0000', callType: 'MTN', isBlinking: false }
  }

  // ✅ PRIORITAS 4: Status normal
  if (source === 'limit_switch') {
    return {
      bgColor: '#0d6e18',
      callType: null,
      isBlinking: procStatus === 'start',
    }
  }

  // Equipment
  switch (procStatus) {
    case 'start':
    case 'process':
      return { bgColor: '#0d6e18', callType: null, isBlinking: true }
    case 'finish':
    case 'complete':
      return { bgColor: '#0d6e18', callType: null, isBlinking: false }
    case 'manual':
      return { bgColor: '#ffffff', callType: null, isBlinking: false }
    default:
      return { bgColor: '#00ff04', callType: null, isBlinking: false }
  }
}

export const FactoryLayout: FC<Props> = ({
  act_assy,
  act_ckd,
  activeCalls,
  processStatuses,
}) => {
  // === KOLOM KIRI ===
  const leftBoxes = []
  let currentYLeft = 105
  const leftLabels = [
    undefined,
    undefined,
    undefined,
    'MANUAL ASSY 3',
    undefined,
    'INSPECT',
    undefined,
    'FINAL JUDGE',
    undefined,
    undefined,
  ]

  for (let i = 0; i < leftLabels.length; i++) {
    const label = leftLabels[i]
    const state = label
      ? getStationState(label, activeCalls, processStatuses)
      : { bgColor: '#00ff04', callType: null, isBlinking: false }
    leftBoxes.push({
      y: currentYLeft,
      label,
      ...state,
    })
    currentYLeft += DEFAULT_BOX_HEIGHT + SPACING
  }

  // === KOLOM KANAN ===
  const rightBoxes = []
  let currentY = 20
  const rightLabels = [
    undefined,
    undefined,
    undefined,
    undefined,
    'MANUAL ASSY 2',
    undefined,
    'MANUAL ASSY 1',
    undefined,
    undefined,
    undefined,
    'UN LOADING',
  ]

  for (let i = 0; i < rightLabels.length; i++) {
    const label = rightLabels[i]
    const state = label
      ? getStationState(label, activeCalls, processStatuses)
      : { bgColor: '#00ff04', callType: null, isBlinking: false }
    rightBoxes.push({
      y: currentY,
      label,
      ...state,
    })
    currentY += DEFAULT_BOX_HEIGHT + SPACING
  }

  const getIconSrc = (callType: 'LEADER' | 'MTN' | null): string | null => {
    if (!callType) return null
    if (callType === 'LEADER') return '/images/leader.png'
    if (callType === 'MTN') return '/images/maintenance.png'
    return null
  }

  return (
    <div>
      <div className='relative mx-auto' style={{ width: 380, height: 900 }}>
        {/* Transfer lines */}
        <div
          className='absolute bg-green-800'
          style={{ left: 40, top: 57, width: 25, height: 48 }}
        />
        <div
          className='absolute bg-green-800'
          style={{ left: 40, top: 45, width: 230, height: 25 }}
        />
        <div
          className='absolute bg-green-800'
          style={{ left: 90, top: 850, width: 180, height: 25 }}
        />

        {/* KOLOM KIRI */}
        {leftBoxes.map((box, i) => {
          const key = `left-${i}`
          return (
            <div key={key}>
              <AbsBox
                x={10}
                y={box.y}
                label={box.label}
                
                bgColor={box.bgColor}
                isBlinking={box.isBlinking}
              />
              {/* ✅ TAMPILKAN IKON SELALU JIKA ADA callType */}
              {box.callType && box.label && (
                <img
                  src={
                    box.callType === 'LEADER'
                      ? '/images/leader.png'
                      : '/images/maintenance.png'
                  }
                  alt={box.callType}
                  className='absolute w-12 h-12 pointer-events-none z-50'
                  style={{
                    left: 15 + DEFAULT_BOX_WIDTH + 6,
                    top: box.y + DEFAULT_BOX_HEIGHT / 2 - 22,
                  }}
                />
              )}
            </div>
          )
        })}

        {/* KOLOM KANAN */}
        {rightBoxes.map((box, i) => {
          const key = `right-${i}`
          return (
            <div key={key}>
              <AbsBox
                x={270}
                y={box.y}
                label={box.label}
                
                bgColor={box.bgColor}
                isBlinking={box.isBlinking}
              />
              {/* ✅ TAMPILKAN IKON SELALU JIKA ADA callType */}
              {box.callType && box.label && (
                <img
                  src={
                    box.callType === 'LEADER'
                      ? '/images/leader.png'
                      : '/images/maintenance.png'
                  }
                  alt={box.callType}
                  className='absolute w-12 h-12 pointer-events-none z-50'
                  style={{
                    left: 300 - DEFAULT_BOX_WIDTH, // kiri luar kotak kanan
                    top: box.y + DEFAULT_BOX_HEIGHT / 2 - 22,
                  }}
                />
              )}
            </div>
          )
        })}

        {/* Li / Ni PACK */}
        <AbsBox
          x={110}
          y={900}
          w={70}
          h={85}
          className='flex items-center justify-center font-bold text-2xl px-1 py-1'
        >
          <div className='flex flex-col items-center '>
            <span>ASSY</span>
            <span className='mt-1'>({act_assy})</span>
          </div>
        </AbsBox>
        <AbsBox
          x={190}
          y={900}
          w={70}
          h={85}
          className='flex items-center justify-center font-bold text-2xl px-1 py-1'
        >
          <div className='flex flex-col items-center '>
            <span>CKD</span>
            <span className='mt-1'>({act_ckd})</span>
          </div>
        </AbsBox>
      </div>
    </div>
  )
}
