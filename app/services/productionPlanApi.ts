// app/services/productionPlanApi.ts
import { createApi } from '@/lib/api'
import type {
  OrderType,
  Shift,
  ModelPlan,
  PlanHistory,
} from '@/types/prod-control'

const api = createApi()

// ── Response types from backend ────────────────────────────────────────────

export interface ApiOrderType {
  FID: number
  ORDER_TYPE: string
  SORT_ORDER: number
  IS_ACTIVE: number // 1 = aktif, 0 = tidak aktif
}

export interface ApiModel {
  FID: number
  FMODEL_BATTERY: string | null
  IS_DEFAULT: number // 1 = default, 0 = bukan
  IS_ACTIVE: number // 1 = aktif, 0 = tidak aktif
}

export interface ApiPlanDetail {
  FID: number
  FID_PLAN: number
  MODEL_NAME: string
  ORDER_TYPE: string
  QTY_PLAN: number
  SEQ_GENERATED: number // 1 = sudah generate, 0 = belum
  SEQ_GENERATED_AT: string | null
  CREATED_AT: string
  UPDATED_AT: string | null
}

export interface ApiPlan {
  FID: number
  PLAN_DATE: string
  SHIFT: string
  IS_LOCKED: number // 1 = terkunci, 0 = bisa edit
  CREATED_AT: string
  UPDATED_AT: string | null
  details: ApiPlanDetail[]
}

// ── Save-plan payload ──────────────────────────────────────────────────────

export interface SavePlanPayload {
  date: string
  shift: Shift
  details: Array<{ modelName: string; orderType: string; qtyPlan: number }>
}

// ── Mappers ────────────────────────────────────────────────────────────────

/** Convert API plan response to frontend ModelPlan[] */
export function apiPlanToModelPlans(plan: ApiPlan): {
  models: ModelPlan[]
  planId: number
  planLocked: boolean
} {
  // Collect unique model names (preserve order)
  const modelNames = [...new Set(plan.details.map((d) => d.MODEL_NAME))]

  const models: ModelPlan[] = modelNames.map((name) => {
    const plansMap: Record<string, number> = {}
    for (const d of plan.details) {
      if (d.MODEL_NAME === name) {
        plansMap[d.ORDER_TYPE] = d.QTY_PLAN
      }
    }
    return {
      id: String(name), // use name as stable local id
      name,
      plans: plansMap as Record<OrderType, number>,
      isDefault: false,
    }
  })

  return { models, planId: plan.FID, planLocked: plan.IS_LOCKED === 1 }
}

/** Convert API plan to PlanHistory[] for the history table */
export function apiPlansToHistory(plans: ApiPlan[]): PlanHistory[] {
  const rows: PlanHistory[] = []
  for (const plan of plans) {
    for (const d of plan.details) {
      rows.push({
        id: String(d.FID),
        date: plan.PLAN_DATE.split('T')[0],
        orderType: d.ORDER_TYPE as OrderType,
        modelName: d.MODEL_NAME,
        plan: d.QTY_PLAN,
        act: 0,
        eff: 0,
        downtime: 0,
        shift: plan.SHIFT as Shift,
        createdAt: plan.CREATED_AT,
        sequenceGenerated: d.SEQ_GENERATED === 1,
      })
    }
  }
  return rows
}

// ── API methods ────────────────────────────────────────────────────────────

export const productionPlanApi = {
  /** GET /production-plan/order-types */
  getOrderTypes: async (): Promise<ApiOrderType[]> => {
    const { data } = await api.get('/production-plan/order-types')
    return data
  },

  /** GET /production-plan/models */
  getModels: async (): Promise<ApiModel[]> => {
    const { data } = await api.get('/production-plan/models')
    return data
  },

  /** GET /production-plan?date=YYYY-MM-DD&shift=DAY|NIGHT */
  getPlan: async (date: string, shift: Shift): Promise<ApiPlan | null> => {
    const { data } = await api.get('/production-plan', {
      params: { date, shift },
    })
    return data
  },

  /** POST /production-plan */
  savePlan: async (payload: SavePlanPayload): Promise<ApiPlan> => {
    const { data } = await api.post('/production-plan', payload)
    return data
  },

  /** POST /production-plan/:planId/generate */
  generateSequence: async (
    planId: number,
    modelName: string,
    orderType: string,
  ): Promise<{ success: boolean; updatedAt: string }> => {
    const { data } = await api.post(`/production-plan/${planId}/generate`, {
      modelName,
      orderType,
    })
    return data
  },

  /** GET /production-plan/history?from=YYYY-MM-DD&to=YYYY-MM-DD */
  getHistory: async (from: string, to: string): Promise<ApiPlan[]> => {
    const { data } = await api.get('/production-plan/history', {
      params: { from, to },
    })
    return data
  },
}
