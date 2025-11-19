// abs-station.tsx
import { type ReactNode } from 'react'

export const DEFAULT_BOX_WIDTH = 40
export const DEFAULT_BOX_HEIGHT = 80
export const FontSize = 17
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

export function AbsBox({
  x,
  y,
  w = DEFAULT_BOX_WIDTH,
  h = DEFAULT_BOX_HEIGHT,
  className = '',
  children,
  label,
  labelFontSize = FontSize,
  bgColor = '#00ff04',
  isBlinking = false,
}: BoxProps) {
  // Cek apakah bgColor itu hex/rgb (bukan Tailwind class)
  const isCustomColor = bgColor.startsWith('#') || bgColor.startsWith('rgb')

  // Kelas blink (bisa dipakai di CSS global)
  const blinkClass = isBlinking ? 'animate-blink' : ''

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
          className='absolute inset-0 flex items-center justify-center font-bold uppercase pointer-events-none text-black'
          style={{
            transform: 'rotate(90deg)',
            transformOrigin: 'center',
            fontSize: labelFontSize,
            lineHeight: 1,
            padding: '2px',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}
