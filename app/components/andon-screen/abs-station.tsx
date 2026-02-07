// abs-station.tsx
import { type ReactNode } from 'react'

export const DEFAULT_BOX_WIDTH = 85
export const DEFAULT_BOX_HEIGHT = 75
export const FontSize = 25
type BoxProps = {
  x: number
  y: number
  w?: number
  h?: number
  className?: string
  children?: ReactNode
  label?: string
  labelFontSize?: number
  bgColor?: string // ✅ terima warna custom
  isBlinking?: boolean // ✅ terima blink
}

// abs-station.tsx

export function AbsBox({
  x,
  y,
  w = DEFAULT_BOX_WIDTH,
  h = DEFAULT_BOX_HEIGHT,
  className = '',
  children,
  label,
  bgColor = '#00ff04',
  isBlinking = false,
}: BoxProps) {
  const isCustomColor = bgColor.startsWith('#') || bgColor.startsWith('rgb')
  const blinkClass = isBlinking ? 'animate-blink' : ''

  // Hitung skala berdasarkan panjang teks
  const getScale = (text: string) => {
    const len = text.length
    if (len <= 8) return 1.1
    if (len <= 12) return 1.2
    if (len <= 16) return 1.3
    return 0.7
  }

  const scale = label ? getScale(label) : 1

  return (
    <div
      className={`absolute border-3 border-[var(--color-line-black)] ${isCustomColor ? '' : bgColor} ${blinkClass} ${className}`}
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        ...(isCustomColor ? { backgroundColor: bgColor } : {}),
      }}
      aria-hidden={!children && !label}
    >
      {children}
      {label && (
        <div
          className='absolute inset-0 flex items-center justify-center pointer-events-none'
          style={{
            fontSize: '16px',
            lineHeight: 1,
            textAlign: 'center',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <span
            className='inline-block font-bold uppercase text-black'
            style={{
              maxWidth: `${w - 8}px`,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              transformOrigin: 'center',
              transform: `scale(${scale})`,
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  )
}
