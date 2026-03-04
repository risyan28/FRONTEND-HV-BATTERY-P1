// components/DowntimePanel.tsx
import type { DowntimeData } from '@/types/downtime'

interface DowntimePanelProps {
  downtimeData: DowntimeData[]
  isLandscape?: boolean
}

export function DowntimePanel({
  downtimeData,
  isLandscape = false,
}: DowntimePanelProps) {
  // Daftar station sesuai mode
  const portraitCols = [
    'UNLOADING',
    'MAN ASSY 1',
    'MAN ASSY 2',
    'MAN ASSY 3',
    'INSPECTION',
    'FINAL JUDGE',
  ]

  const landscapeCols = [
    'UN LOADING',
    'MANUAL ASSY 1',
    'MANUAL ASSY 2',
    'MANUAL ASSY 3',
    'INSPECT',
    'FINAL JUDGE',
  ]

  const cols = isLandscape ? landscapeCols : portraitCols

  // Mapping: nama di DB → nama di UI (berbeda per mode)
  const portraitDB_TO_UI: Record<string, string> = {
    'STACK LOADING': 'UNLOADING',
    'MANUAL ASSY 1': 'MAN ASSY 1',
    'MANUAL ASSY 2': 'MAN ASSY 2',
    'MANUAL ASSY 3': 'MAN ASSY 3',
    CHARGING: 'INSPECTION',
    'FINAL JUDGE': 'FINAL JUDGE',
  }

  const landscapeDB_TO_UI: Record<string, string> = {
    'STACK LOADING': 'UN LOADING',
    'MANUAL ASSY 1': 'MANUAL ASSY 1',
    'MANUAL ASSY 2': 'MANUAL ASSY 2',
    'MANUAL ASSY 3': 'MANUAL ASSY 3',
    CHARGING: 'INSPECT',
    'FINAL JUDGE': 'FINAL JUDGE',
  }

  const DB_TO_UI = isLandscape ? landscapeDB_TO_UI : portraitDB_TO_UI

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
    <section
      className={`border-4 border-(--color-line-black) bg-white rounded-md flex flex-col ${isLandscape ? 'h-full' : ''}`}
    >
      {/* Header */}
      <h2
        className={`text-center font-bold uppercase border-b-3 border-(--color-line-black) bg-gray-300 ${isLandscape ? 'text-5xl py-1' : 'text-4xl'}`}
      >
        DOWNTIME
      </h2>

      {/* Column Headers */}
      <div className='grid grid-cols-6 gap-1 p-1 border-b-3 border-(--color-line-black)'>
        {cols.map((c, i) =>
          isLandscape ? (
            <div
              key={i}
              className='border-3 border-(--color-line-black) flex items-center justify-center p-1 text-center text-md font-bold uppercase leading-tight'
            >
              {c}
            </div>
          ) : (
            <div
              key={i}
              className='border-3 border-(--color-line-black) flex items-center justify-center p-1 relative min-h-35'
            >
              <span className='absolute inset-0 flex items-center justify-center rotate-90 origin-center text-xl font-bold uppercase whitespace-nowrap pointer-events-none'>
                {c}
              </span>
            </div>
          ),
        )}
      </div>

      {/* FREQUENCY Section */}
      <div
        className={`text-center font-bold uppercase border-b-3 border-(--color-line-black) bg-gray-300 px-1 py-1 ${isLandscape ? 'text-5xl' : 'text-4xl'}`}
      >
        [FREQUENCY]
      </div>
      <div
        className={`grid grid-cols-6 gap-1 px-1 py-1 border-b-3 border-(--color-line-black) ${isLandscape ? 'flex-1' : ''}`}
      >
        {times.map((v, i) => (
          <div
            key={`times-${i}`}
            className={`border-3 border-(--color-line-black) text-center font-bold flex items-center justify-center ${isLandscape ? 'text-5xl' : 'text-4xl h-14'}`}
          >
            {v}
          </div>
        ))}
      </div>

      {/* MINUTES Section */}
      <div
        className={`text-center font-bold uppercase border-b-3 border-(--color-line-black) bg-gray-300 px-1 py-1 ${isLandscape ? 'text-5xl' : 'text-4xl'}`}
      >
        [MINUTES]
      </div>
      <div
        className={`grid grid-cols-6 gap-1 px-1 py-1 ${isLandscape ? 'flex-1' : ''}`}
      >
        {minutes.map((v, i) => (
          <div
            key={`minutes-${i}`}
            className={`border-3 border-(--color-line-black) text-center font-bold flex items-center justify-center ${isLandscape ? 'text-[38px]' : 'text-[30px] h-14'}`}
          >
            {v}
          </div>
        ))}
      </div>
    </section>
  )
}
