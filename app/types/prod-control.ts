export type OrderType = 'Assy' | 'CKD' | 'Service Part'
export type Shift = 'DAY' | 'NIGHT'

export interface ModelRow {
  id: string
  name: string
  plan: number
  downtime: number
  act: number
  eff: number
  isDefault: boolean
}

export interface ModelPlan {
  id: string
  name: string
  plans: Record<OrderType, number>
  isDefault: boolean
}

export interface PlanHistory {
  id: string
  date: string
  orderType: OrderType
  modelName: string
  plan: number
  act: number
  eff: number
  downtime: number
  shift: Shift
  createdAt: string
  sequenceGenerated: boolean
}

export type TabModels = Record<OrderType, ModelRow[]>
