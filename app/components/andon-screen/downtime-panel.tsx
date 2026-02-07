// components/DowntimePanel.tsx
import type { DowntimeData } from '@/types/downtime'

interface DowntimePanelProps {
  downtimeData: DowntimeData[]
}

export function DowntimePanel({ downtimeData }: DowntimePanelProps) {
  // Daftar station sesuai UI (urutan tetap)
  const cols = [
    'UNLOADING',
    'MAN ASSY 1',
    'MAN ASSY 2',
    'MAN ASSY 3',
    'CHARGING',
    'FINAL JUDGE',
  ]

  // Mapping: nama di DB → nama di UI
  const DB_TO_UI: Record<string, string> = {
    'STACK LOADING': 'UNLOADING',
    'MANUAL ASSY 1': 'MAN ASSY 1',
    'MANUAL ASSY 2': 'MAN ASSY 2',
    'MANUAL ASSY 3': 'MAN ASSY 3',
    CHARGING: 'CHARGING', // Sesuaikan jika di DB beda (misal: 'CHARGING')
    'FINAL JUDGE': 'FINAL JUDGE',
  }

  // Buat map berdasarkan nama UI
  const uiMap = new Map<string, { times: number; minutes: number }>()

  // Isi map dari data DB
  downtimeData.forEach((entry) => {
    const uiName = DB_TO_UI[entry.station]
    if (uiName && cols.includes(uiName)) {
      uiMap.set(uiName, { times: entry.times, minutes: entry.minutes })
    }
    // Jika station tidak dikenal, abaikan (atau log warning)
  })

  // Generate arrays sesuai urutan cols
  const times = cols.map((station) => uiMap.get(station)?.times || 0)
  const minutes = cols.map((station) => uiMap.get(station)?.minutes || 0)

  return (
    <section className='border-4 border-(--color-line-black) bg-white rounded-md mt-1'>
      {/* Header */}
      <h2 className='text-center font-bold uppercase border-b-3 border-(--color-line-black) text-4xl bg-gray-300'>
        DOWNTIME
      </h2>

      {/* Column Headers - ROTATED TEXT */}
      <div className='grid grid-cols-6 gap-1 p-1 border-b-3 border-(--color-line-black)'>
        {cols.map((c, i) => (
          <div
            key={i}
            className='border-3 border-(--color-line-black) flex items-center justify-center min-h-35 p-1 relative'
          >
            <span className='absolute inset-0 flex items-center justify-center rotate-90 origin-center text-xl font-bold uppercase whitespace-nowrap pointer-events-none'>
              {c}
            </span>
          </div>
        ))}
      </div>

      {/* TIMES Section */}
      <div className='text-center font-bold uppercase border-b-3 border-(--color-line-black) text-4xl bg-gray-300 px-1 py-1'>
        [TIMES]
      </div>
      <div className='grid grid-cols-6 gap-1 px-1 py-1 border-b-3 border-(--color-line-black)'>
        {times.map((v, i) => (
          <div
            key={`times-${i}`}
            className='border-3 border-(--color-line-black) text-center font-bold text-5xl flex items-center justify-center h-14'
          >
            {v}
          </div>
        ))}
      </div>

      {/* MINUTES Section */}
      <div className='text-center font-bold uppercase border-b-3 border-(--color-line-black) text-4xl bg-gray-300 px-1 py-1'>
        [MINUTES]
      </div>
      <div className='grid grid-cols-6 gap-1 px-1 py-1'>
        {minutes.map((v, i) => (
          <div
            key={`minutes-${i}`}
            className='border-3 border-(--color-line-black) text-center font-bold text-[30px] flex items-center justify-center h-14'
          >
            {v}
          </div>
        ))}
      </div>
    </section>
  )
}
