import type { OrderType, ModelPlan } from '@/types/prod-control'

export const ORDER_TYPES: OrderType[] = ['Assy', 'CKD', 'Service Part']

export const ORDER_TYPE_COLORS: Record<OrderType, string> = {
  Assy: 'bg-blue-100 text-blue-700 border-blue-200',
  CKD: 'bg-amber-100 text-amber-700 border-amber-200',
  'Service Part': 'bg-green-100 text-green-700 border-green-200',
}

export const DEFAULT_MODEL_PLANS: ModelPlan[] = [
  {
    id: '1',
    name: 'Li-688D',
    plans: { Assy: 0, CKD: 0, 'Service Part': 0 },
    isDefault: true,
  },
]
