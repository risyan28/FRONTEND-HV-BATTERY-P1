'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type {
  OrderType,
  Shift,
  ModelPlan,
  TabModels,
  ModelRow,
  PlanHistory,
} from '../types/prod-control'
import {
  ORDER_TYPES,
  DEFAULT_MODEL_PLANS,
} from '../dashboard-user/manufacture/production-control/constants'
import {
  productionPlanApi,
  apiPlanToModelPlans,
  apiPlanToActualQtyByKey,
  apiPlansToHistory,
} from '@/services/productionPlanApi'
import { addDaysJakartaISO, getJakartaISODate } from '@/lib/datetime'
import { getSocket, subscribeRoom, unsubscribeRoom } from '@/lib/socket'

const genId = () => Math.random().toString(36).slice(2)

const getTodayISO = () => getJakartaISODate()

// Derive TabModels from ModelPlan[] for SummaryCards compatibility
function toTabModels(models: ModelPlan[], activeOts: string[]): TabModels {
  const result: TabModels = { Assy: [], CKD: [], 'Service Part': [] }
  const ots = activeOts.length > 0 ? activeOts : ORDER_TYPES
  for (const ot of ots) {
    const otKey = ot as OrderType
    result[otKey] = models.map(
      (m): ModelRow => ({
        id: m.id,
        name: m.name,
        plan: m.plans[otKey] ?? 0,
        downtime: 0,
        act: 0,
        eff: 0,
        isDefault: m.isDefault,
      }),
    )
  }
  return result
}

export function useProductionControl() {
  // Loading / error state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reset-all state
  const [isResetAllLoading, setIsResetAllLoading] = useState(false)

  // Form state
  const [date, setDate] = useState(getTodayISO())
  const today = date
  const [shift, setShift] = useState<Shift>('DAY')
  const [models, setModels] = useState<ModelPlan[]>(DEFAULT_MODEL_PLANS)
  const [activeModel, setActiveModel] = useState<string>(
    DEFAULT_MODEL_PLANS[0].id,
  )
  const [newModelName, setNewModelName] = useState('')

  // Plan state
  const [planSaved, setPlanSaved] = useState(false)
  const [planLocked, setPlanLocked] = useState(false)
  const [savedSummary, setSavedSummary] = useState<ModelPlan[] | null>(null)
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null)

  // Actual state (per-item key = `${modelName}::${orderType}`)
  const [actualQtyByKey, setActualQtyByKey] = useState<Record<string, number>>(
    {},
  )

  // History state
  const [history, setHistory] = useState<PlanHistory[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Generate state (per-item key = `${modelName}-${orderType}`)
  const [generatingItem, setGeneratingItem] = useState<string | null>(null)
  const [generatedQtyByKey, setGeneratedQtyByKey] = useState<
    Record<string, number>
  >({})

  // Master data from API
  const [orderTypesFromApi, setOrderTypesFromApi] = useState<string[]>([])
  const [activeOtNamesFromApi, setActiveOtNamesFromApi] = useState<string[]>([])
  const [modelsFromApi, setModelsFromApi] = useState<
    { name: string; isDefault: boolean }[]
  >([])

  // Global setting
  const [cycleTime, setCycleTime] = useState<number>(0)

  // Prevent double-fetching in StrictMode
  const initDone = useRef(false)

  // â”€â”€ Derive today's history date range â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const historyDefaultFrom = useMemo(() => {
    return addDaysJakartaISO(getTodayISO(), -30)
  }, [])

  // â”€â”€ Initial load â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    if (initDone.current) return
    initDone.current = true

    const load = async () => {
      setIsLoading(true)
      try {
        const [otData, mdData, cycleData, planData, histData] =
          await Promise.all([
            productionPlanApi.getOrderTypes(),
            productionPlanApi.getModels(),
            productionPlanApi.getCycleTime(),
            productionPlanApi.getPlan(getTodayISO(), 'DAY'),
            productionPlanApi.getHistory(historyDefaultFrom, getTodayISO()),
          ])

        setCycleTime(Number(cycleData?.cycleTime ?? 0))

        // Populate master lists
        setOrderTypesFromApi(otData.map((o) => o.ORDER_TYPE))
        setActiveOtNamesFromApi(
          otData.filter((o) => o.IS_ACTIVE === 1).map((o) => o.ORDER_TYPE),
        )
        setModelsFromApi(
          mdData.map((m) => ({
            name: m.FMODEL_BATTERY ?? '',
            isDefault: m.IS_DEFAULT === 1,
          })),
        )

        // If a plan already exists for today, pre-fill the form
        if (planData && planData.details.length > 0) {
          const {
            models: existingModels,
            planId,
            planLocked: locked,
          } = apiPlanToModelPlans(planData)
          setModels(existingModels)
          setActualQtyByKey(apiPlanToActualQtyByKey(planData))
          setActiveModel(existingModels[0]?.id ?? DEFAULT_MODEL_PLANS[0].id)
          setCurrentPlanId(planId)
          setPlanSaved(true)
          setPlanLocked(locked)
          setSavedSummary(existingModels)
          setGeneratedQtyByKey(
            Object.fromEntries(
              planData.details
                .filter((d) => d.SEQ_GENERATED === 1)
                .map((d) => [`${d.MODEL_NAME}-${d.ORDER_TYPE}`, d.QTY_PLAN]),
            ),
          )
        } else {
          // Build default models from API master data
          const defaultModels: ModelPlan[] = mdData.map((m, i) => ({
            id: String(i + 1),
            name: m.FMODEL_BATTERY ?? '',
            plans: Object.fromEntries(
              otData.map((o) => [o.ORDER_TYPE, 0]),
            ) as Record<OrderType, number>,
            isDefault: m.IS_DEFAULT === 1,
          }))
          if (defaultModels.length > 0) {
            setModels(defaultModels)
            setActiveModel(defaultModels[0].id)
          }
          setActualQtyByKey({})
          setGeneratedQtyByKey({})
        }

        // Populate history
        setHistory(apiPlansToHistory(histData))
      } catch (err) {
        console.error('Failed to load production data:', err)
        setError('Failed to load production data. Using defaults.')
        // Fall back to default local data so the page is still functional
        setModels(DEFAULT_MODEL_PLANS)
        setActiveModel(DEFAULT_MODEL_PLANS[0].id)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [historyDefaultFrom])

  // Re-fetch plan when date or shift changes
  useEffect(() => {
    if (!initDone.current) return
    const refetch = async () => {
      setIsLoading(true)
      try {
        const planData = await productionPlanApi.getPlan(date, shift)
        if (planData && planData.details.length > 0) {
          const {
            models: existingModels,
            planId,
            planLocked: locked,
          } = apiPlanToModelPlans(planData)
          setModels(existingModels)
          setActualQtyByKey(apiPlanToActualQtyByKey(planData))
          setActiveModel(existingModels[0]?.id ?? '')
          setCurrentPlanId(planId)
          setPlanSaved(true)
          setPlanLocked(locked)
          setSavedSummary(existingModels)
          setGeneratedQtyByKey(
            Object.fromEntries(
              planData.details
                .filter((d) => d.SEQ_GENERATED === 1)
                .map((d) => [`${d.MODEL_NAME}-${d.ORDER_TYPE}`, d.QTY_PLAN]),
            ),
          )
        } else {
          // Reset to blank plan for the new date/shift
          const blankModels =
            modelsFromApi.length > 0
              ? modelsFromApi.map((m, i) => ({
                  id: String(i + 1),
                  name: m.name,
                  plans: Object.fromEntries(
                    (orderTypesFromApi.length > 0
                      ? orderTypesFromApi
                      : ORDER_TYPES
                    ).map((ot) => [ot, 0]),
                  ) as Record<OrderType, number>,
                  isDefault: m.isDefault,
                }))
              : DEFAULT_MODEL_PLANS
          setModels(blankModels)
          setActiveModel(blankModels[0].id)
          setCurrentPlanId(null)
          setPlanSaved(false)
          setPlanLocked(false)
          setSavedSummary(null)
          setActualQtyByKey({})
          setGeneratedQtyByKey({})
        }
      } catch (err) {
        console.error('Failed to fetch plan:', err)
      } finally {
        setIsLoading(false)
      }
    }
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, shift])

  // Realtime actual: listen prod-plan-detail updates via WS and refresh actuals
  useEffect(() => {
    const socket = getSocket()
    const topic = 'prod-plan-detail'
    const eventName = 'prod-plan-detail:update'

    type WsPlanDetailRow = {
      PROD_DATE: string | null
      SHIFT: string
      MODEL_NAME: string
      ORDER_TYPE: string
      QTY_ACTUAL: number
      QTY_PLAN?: number
    }

    type WsPayload = {
      kind?: 'snapshot' | 'delta'
      rows?: WsPlanDetailRow[]
    }

    subscribeRoom(topic)

    const onPlanDetailUpdate = (payload: WsPayload) => {
      const rows = payload?.rows
      if (!Array.isArray(rows) || rows.length === 0) return

      // Only apply rows relevant to current selection.
      const relevant = rows.filter(
        (r) =>
          String(r.PROD_DATE ?? '') === date && String(r.SHIFT ?? '') === shift,
      )
      if (relevant.length === 0) return

      // Update plan numbers only when locked (avoid overriding user edits)
      if (planLocked) {
        setModels((prev) =>
          prev.map((m) => {
            const updatesForModel = relevant.filter(
              (r) => String(r.MODEL_NAME ?? '') === m.name,
            )
            if (updatesForModel.length === 0) return m

            const nextPlans = { ...m.plans }
            for (const r of updatesForModel) {
              if (typeof r.QTY_PLAN === 'number') {
                nextPlans[r.ORDER_TYPE as OrderType] = Number(r.QTY_PLAN)
              }
            }
            return { ...m, plans: nextPlans }
          }),
        )
      }

      setActualQtyByKey((prev) => {
        const next = { ...prev }
        for (const r of relevant) {
          const key = `${String(r.MODEL_NAME ?? '')}::${String(r.ORDER_TYPE ?? '')}`
          next[key] = Number(r.QTY_ACTUAL ?? 0)
        }
        return next
      })
    }

    socket.on(eventName, onPlanDetailUpdate)

    return () => {
      socket.off(eventName, onPlanDetailUpdate)
      unsubscribeRoom(topic)
    }
  }, [date, shift, planLocked])

  // â”€â”€ Model handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const updatePlan = useCallback(
    (modelId: string, ot: OrderType, value: number) => {
      setModels((prev) =>
        prev.map((m) =>
          m.id === modelId ? { ...m, plans: { ...m.plans, [ot]: value } } : m,
        ),
      )
    },
    [],
  )

  const addModel = useCallback(() => {
    const name = newModelName.trim()
    if (!name) return
    const id = genId()
    setModels((prev) => [
      ...prev,
      {
        id,
        name,
        plans: Object.fromEntries(
          (orderTypesFromApi.length > 0 ? orderTypesFromApi : ORDER_TYPES).map(
            (ot) => [ot, 0],
          ),
        ) as Record<OrderType, number>,
        isDefault: false,
      },
    ])
    setActiveModel(id)
    setNewModelName('')
  }, [newModelName, orderTypesFromApi])

  const removeModel = useCallback(
    (id: string) => {
      setModels((prev) => {
        const next = prev.filter((m) => m.id !== id)
        if (activeModel === id && next.length > 0) setActiveModel(next[0].id)
        return next
      })
    },
    [activeModel],
  )

  const resetForm = useCallback(() => {
    const blankModels =
      modelsFromApi.length > 0
        ? modelsFromApi.map((m, i) => ({
            id: String(i + 1),
            name: m.name,
            plans: Object.fromEntries(
              (orderTypesFromApi.length > 0
                ? orderTypesFromApi
                : ORDER_TYPES
              ).map((ot) => [ot, 0]),
            ) as Record<OrderType, number>,
            isDefault: m.isDefault,
          }))
        : DEFAULT_MODEL_PLANS
    setModels(blankModels)
    setActiveModel(blankModels[0].id)
    setShift('DAY')
    setPlanSaved(false)
    setPlanLocked(false)
    setSavedSummary(null)
    setCurrentPlanId(null)
    setGeneratedQtyByKey({})
  }, [modelsFromApi, orderTypesFromApi])

  // â”€â”€ Save plan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const savePlan = useCallback(async () => {
    try {
      setIsLoading(true)
      const details = models.flatMap((m) =>
        ORDER_TYPES.map((ot) => ({
          modelName: m.name,
          orderType: ot,
          qtyPlan: m.plans[ot] ?? 0,
        })),
      )

      const saved = await productionPlanApi.savePlan({
        date: today,
        shift,
        details,
      })

      setCurrentPlanId(saved.FID)
      setPlanSaved(true)
      setPlanLocked(true)
      setSavedSummary([...models])

      // Refresh history to include new entry
      const histData = await productionPlanApi.getHistory(
        historyDefaultFrom,
        getTodayISO(),
      )
      setHistory(apiPlansToHistory(histData))

      toast.success(`Plan for ${today} (${shift}) saved.`)
    } catch (err) {
      console.error('Failed to save plan:', err)
      toast.error('Failed to save plan. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [models, shift, today, historyDefaultFrom])

  const editPlan = useCallback(() => {
    setPlanLocked(false)
  }, [])

  // â”€â”€ Generate sequence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleGenerate = useCallback(
    async (modelId: string, modelName: string, ot: OrderType) => {
      if (!currentPlanId) {
        toast.error('Plan not saved yet. Save the plan first.')
        return
      }
      const key = `${modelId}-${ot}`
      setGeneratingItem(key)
      try {
        await productionPlanApi.generateSequence(currentPlanId, modelName, ot)
        const currentQty =
          (savedSummary ?? models).find((m) => m.name === modelName)?.plans[
            ot
          ] ?? 0
        setGeneratedQtyByKey((prev) => ({
          ...prev,
          [`${modelName}-${ot}`]: currentQty,
        }))
        setHistory((prev) =>
          prev.map((h) =>
            h.date === today &&
            h.shift === shift &&
            h.modelName === modelName &&
            h.orderType === ot
              ? { ...h, sequenceGenerated: true }
              : h,
          ),
        )
        toast.success(`Sequence generated: ${modelName} â€“ ${ot}.`)
      } catch {
        toast.error('Failed to generate sequence. Please try again.')
      } finally {
        setGeneratingItem(null)
      }
    },
    [currentPlanId, today, shift, savedSummary, models],
  )

  // â”€â”€ Filtered history â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const filteredHistory = useMemo(
    () =>
      history.filter((h) => {
        if (dateFrom && h.date < dateFrom) return false
        if (dateTo && h.date > dateTo) return false
        return true
      }),
    [history, dateFrom, dateTo],
  )

  // Keys of already-generated items for today+shift: `${modelName}-${orderType}`
  const generatedKeys = useMemo(
    () =>
      new Set(
        history
          .filter(
            (h) => h.date === today && h.shift === shift && h.sequenceGenerated,
          )
          .map((h) => `${h.modelName}-${h.orderType}`),
      ),
    [history, today, shift],
  )

  const deltaByKey = useMemo(() => {
    const source = savedSummary ?? models
    const result: Record<string, number> = {}

    for (const m of source) {
      for (const ot of ORDER_TYPES) {
        const key = `${m.name}-${ot}`
        const generatedQty = generatedQtyByKey[key] ?? 0
        result[key] = (m.plans[ot] ?? 0) - generatedQty
      }
    }

    return result
  }, [savedSummary, models, generatedQtyByKey])

  // â”€â”€ Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const summarySource: TabModels = useMemo(
    () => toTabModels(savedSummary ?? models, activeOtNamesFromApi),
    [savedSummary, models, activeOtNamesFromApi],
  )

  const activeOts =
    activeOtNamesFromApi.length > 0 ? activeOtNamesFromApi : ORDER_TYPES

  const allOts = orderTypesFromApi.length > 0 ? orderTypesFromApi : ORDER_TYPES

  const totalPlan = useMemo(
    () =>
      activeOts.reduce(
        (s, ot) =>
          s +
          (summarySource[ot as OrderType]?.reduce((a, m) => a + m.plan, 0) ??
            0),
        0,
      ),
    [summarySource, activeOts],
  )

  const saveCycleTime = useCallback(async () => {
    try {
      setIsLoading(true)
      await productionPlanApi.setCycleTime(cycleTime)
      toast.success('Cycle time saved.')
    } catch (err) {
      console.error('Failed to save cycle time:', err)
      toast.error('Failed to save cycle time. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [cycleTime])

  const resetAllAndonGlobal = useCallback(async () => {
    try {
      setIsResetAllLoading(true)
      const res = await productionPlanApi.resetAndonGlobal()
      toast.success('Reset Andon berhasil.')
    } catch (err) {
      console.error('Failed to reset ANDON global:', err)
      toast.error('Reset Andon gagal. Coba lagi.')
    } finally {
      setIsResetAllLoading(false)
    }
  }, [])

  return {
    today,
    date,
    setDate,
    isLoading,
    error,
    shift,
    setShift,
    models,
    activeModel,
    setActiveModel,
    newModelName,
    setNewModelName,
    cycleTime,
    setCycleTime,
    saveCycleTime,
    resetAllAndonGlobal,
    isResetAllLoading,
    planSaved,
    planLocked,
    actualQtyByKey,
    editPlan,
    savedModels: savedSummary ?? models,
    summarySource,
    totalPlan,
    history,
    filteredHistory,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    generatingItem,
    generatedKeys,
    deltaByKey,
    activeOrderTypes: activeOts,
    allOrderTypes: allOts,
    updatePlan,
    addModel,
    removeModel,
    resetForm,
    savePlan,
    handleGenerate,
  }
}
