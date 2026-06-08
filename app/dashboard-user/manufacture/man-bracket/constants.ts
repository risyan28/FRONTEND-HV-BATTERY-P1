import type { Destination, OrderType } from '@/hooks/use-man-bracket'

export const ORDER_TYPES: OrderType[] = ['ASSY', 'CKD', 'SERVICE PART']
export const DESTINATIONS: Destination[] = ['ASSY', 'CKD', 'SERVICE PART']

export const TYPE_STYLE: Record<
  OrderType,
  { bg: string; border: string; text: string; badge: string }
> = {
  ASSY: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-700',
    badge: 'bg-blue-500',
  },
  CKD: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-700',
    badge: 'bg-amber-500',
  },
  'SERVICE PART': {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    text: 'text-purple-700',
    badge: 'bg-purple-500',
  },
}
