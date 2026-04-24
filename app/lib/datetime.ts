const JAKARTA_TZ = 'Asia/Jakarta'

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: JAKARTA_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function getJakartaISODate(date: Date = new Date()): string {
  return isoDateFormatter.format(date)
}

export function addDaysJakartaISO(baseIsoDate: string, days: number): string {
  // Force Jakarta calendar date by anchoring at midnight +07:00
  const d = new Date(`${baseIsoDate}T00:00:00+07:00`)
  d.setDate(d.getDate() + days)
  return getJakartaISODate(d)
}

export function formatJakartaDateShort(isoDate: string): string {
  const [yyyy, mm, dd] = isoDate.split('-')
  if (!yyyy || !mm || !dd) return isoDate
  return `${dd}/${mm}/${yyyy}`
}

export function formatJakartaDateLong(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00+07:00`)
  if (Number.isNaN(d.getTime())) return isoDate

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: JAKARTA_TZ,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatJakartaDateTimeFull(value: string): string {
  // If already in canonical display format, return as-is
  // Example: 2026-04-17 14:03:22
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return value

  // If it's an ISO-like datetime, normalize without shifting timezone.
  // We treat backend timestamps as already WIB to avoid double +7 conversion.
  // Examples:
  // - 2026-04-17T10:00:00.000Z     -> 2026-04-17 10:00:00
  // - 2026-04-17T10:00:00+07:00    -> 2026-04-17 10:00:00
  // - 2026-04-17 10:00:00.000      -> 2026-04-17 10:00:00
  const isoLike = String(value).match(
    /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/,
  )
  if (isoLike) {
    return `${isoLike[1]} ${isoLike[2]}`
  }

  return value
}

export function toJakartaISODate(value: string): string {
  const s = String(value)
  const direct = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (direct) return direct[1]
  return s
}
