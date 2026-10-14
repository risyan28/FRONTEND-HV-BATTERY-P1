'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { manBracketApi } from '@/services/manBracketApi'
import { handleError } from '@/lib/error-handler'
import logger from '@/lib/logger'
import { getSocket, subscribeRoom, unsubscribeRoom } from '@/lib/socket'
import { useSocketStatus } from '@/hooks/use-socket-status'
import { formatJakartaDateTimeFull } from '@/lib/datetime'

export type OrderType = 'ASSY' | 'CKD' | 'SERVICE PART'
export type Destination = 'ASSY' | 'CKD' | 'SERVICE PART'

const normalizeDestination = (value: unknown): Destination => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()

  return normalized === 'CKD'
    ? 'CKD'
    : normalized === 'SERVICE PART'
      ? 'SERVICE PART'
      : 'ASSY'
}

const extractPackPartBattery = (barcode: string): string | null => {
  const normalized = String(barcode ?? '')
    .trim()
    .toUpperCase()
  return normalized.match(/[A-Z]\d{4}/)?.[0] ?? null
}

export interface Sequence {
  id: string
  recordId?: number
  name: string
  seqNo: string
  barcode: string
  seqType: string
  orderType: OrderType
  status: 'queue' | 'in-progress' | 'completed' | 'held' | 'pulled-out'
  priority: number
  estimatedTime: number
  startTime?: Date
  completedTime?: Date
  completedTimeText?: string
  isSelected: boolean
  isMarked: boolean
  lastUpdate: Date
  destination?: Destination
}

interface ManBracketSocketRecord {
  FID: number
  FVALUE: number
}

interface ManBracketSocketPayload {
  records?: ManBracketSocketRecord[]
}

interface UseManBracketResult {
  sequences: Sequence[]
  completedSeqs: Sequence[]
  completedCounts: Record<OrderType, number>
  isLoading: boolean
  isSubmitting: boolean
  showCompletePopup: boolean
  showWarningPopup: boolean
  showScanBlockPopup: boolean
  warningNotice: string | null
  scanBarcode: string
  interlockOn: boolean
  manualDestination: Destination
  autoDestination: Destination
  showSettings: boolean
  inputMode: 'usb' | 'serial'
  scanInputRef: React.RefObject<HTMLInputElement | null>
  completedListRef: React.RefObject<HTMLDivElement | null>
  currentSeq: Sequence | null
  activeDestination: Destination
  stdStock: number
  actBufferStock: number

  setScanBarcode: (value: string) => void
  setInterlockOn: (value: boolean) => void
  setManualDestination: (value: Destination) => void
  setShowSettings: (value: boolean) => void
  setInputMode: (value: 'usb' | 'serial') => void

  fetchCompletedSequences: () => Promise<void>
  fetchStock: () => Promise<void>
  fetchAutoDestination: () => Promise<Destination | null>
  handleToggleInterlock: (password: string) => Promise<void>
  handleSetManualDestination: (dest: Destination) => void
  handleScanSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleResetProcess: () => Promise<void>
  handleCompleteProcess: () => Promise<void>
}

export const useManBracket = (): UseManBracketResult => {
  const { connected } = useSocketStatus()
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [completedSeqs, setCompletedSeqs] = useState<Sequence[]>([])
  const [completedCounts, setCompletedCounts] = useState<
    Record<OrderType, number>
  >({ ASSY: 0, CKD: 0, 'SERVICE PART': 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [showCompletePopup, setShowCompletePopup] = useState(false)
  const [showWarningPopup, setShowWarningPopup] = useState(false)
  const [warningNotice, setWarningNotice] = useState<string | null>(null)
  const [showScanBlockPopup, setShowScanBlockPopup] = useState(false)
  const [scanBarcode, setScanBarcode] = useState('')
  const [interlockOn, setInterlockOn] = useState<boolean>(
    () =>
      (typeof window !== 'undefined'
        ? localStorage.getItem('man-bracket-dest-mode')
        : null) !== 'off',
  )
  const [manualDestination, setManualDestination] = useState<Destination>(
    () =>
      (typeof window !== 'undefined'
        ? (localStorage.getItem('man-bracket-manual-dest') as Destination)
        : null) ?? 'ASSY',
  )
  const [autoDestination, setAutoDestination] = useState<Destination>('ASSY')
  const [stdStock, setStdStock] = useState(0)
  const [actBufferStock, setActBufferStock] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [inputMode, setInputMode] = useState<'usb' | 'serial'>(
    () =>
      (typeof window !== 'undefined'
        ? (localStorage.getItem('man-bracket-input-mode') as 'usb' | 'serial')
        : null) ?? 'usb',
  )

  const scanInputRef = useRef<HTMLInputElement | null>(null)
  const completedListRef = useRef<HTMLDivElement | null>(null)
  const scanCounterRef = useRef(1)
  const serialScanRef = useRef('')
  const currentSeqRef = useRef<Sequence | null>(null)
  const handleScanSubmitRef = useRef<((event: React.FormEvent<HTMLFormElement>) => Promise<void>) | null>(null)
  const markCompletedRef = useRef<((source: 'ws' | 'api-fallback' | 'manual') => void) | null>(null)
  const completePopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const warningPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const scanBlockPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const currentSeq = sequences.find((s) => s.status === 'in-progress') ?? null
  currentSeqRef.current = currentSeq
  const activeDestination: Destination = interlockOn
    ? autoDestination
    : manualDestination

  const formatDbDateTime = (value?: string | null): string => {
    if (!value) return '-'

    return formatJakartaDateTimeFull(String(value))
  }

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setSequences([])
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Fetch destination dari DB on mount jika interlock ON
  useEffect(() => {
    if (interlockOn) fetchAutoDestination()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCompletedSequences = useCallback(async () => {
    try {
      logger.debug('Fetching completed sequences')
      const { records, countsByDestination } = await manBracketApi.getCompleted({
        fvalue: 1,
      })

      const mappedRecords: Sequence[] = records.map((record: any) => {
        const barcode = String(record.BARCODE ?? '')
        const destination = normalizeDestination(record.DESTINATION)
        const seqNo = barcode.match(/(\d{7})$/)?.[1] ?? '0000000'

        return {
          id: `completed-${record.FID}`,
          recordId: record.FID,
          name: barcode,
          seqNo,
          barcode,
          seqType: 'LI-688D',
          orderType: destination,
          status: 'completed',
          priority: 1,
          estimatedTime: 0,
          startTime: record.START_TIME
            ? new Date(record.START_TIME)
            : undefined,
          completedTime: record.COMPLETED_TIME
            ? new Date(record.COMPLETED_TIME)
            : undefined,
          completedTimeText: formatDbDateTime(record.COMPLETED_TIME),
          isSelected: false,
          isMarked: false,
          lastUpdate: record.COMPLETED_TIME
            ? new Date(record.COMPLETED_TIME)
            : new Date(),
          destination,
        }
      })

      mappedRecords.sort((a, b) => {
        const left = a.completedTimeText ?? ''
        const right = b.completedTimeText ?? ''
        return left.localeCompare(right)
      })

      setCompletedSeqs(mappedRecords)
      setCompletedCounts(
        countsByDestination.reduce(
          (acc, item) => {
            acc[normalizeDestination(item.destination)] = Number(item.count) || 0
            return acc
          },
          { ASSY: 0, CKD: 0, 'SERVICE PART': 0 } as Record<OrderType, number>,
        ),
      )
      logger.info('Completed sequences loaded', { count: mappedRecords.length })
    } catch (error) {
      handleError(error, { operation: 'fetchCompletedSequences' })
    }
  }, [])

  const fetchStock = useCallback(async () => {
    try {
      const { stdStock, bufferStock } = await manBracketApi.getStock()
      setStdStock(stdStock)
      setActBufferStock(bufferStock)
    } catch (error) {
      handleError(error, { operation: 'fetchStock' })
    }
  }, [])

  const fetchAutoDestination =
    useCallback(async (): Promise<Destination | null> => {
      try {
        logger.debug('Fetching auto destination config')
        const destination = await manBracketApi.getDestinationConfig()
        if (destination) {
          setAutoDestination(destination)
          logger.debug('Auto destination updated', { destination })
          return destination
        }
        return null
      } catch {
        logger.warn('Failed to fetch auto destination')
        return null
      }
    }, [])

  const resolveDestinationFromBarcode = useCallback(
    async (
      barcode: string,
      fallbackDestination: Destination,
    ): Promise<Destination> => {
      const packPartBattery = extractPackPartBattery(barcode)

      if (packPartBattery === 'F7030') {
        return 'SERVICE PART'
      }

      if (packPartBattery === 'F7040') {
        return fallbackDestination
      }

      return fallbackDestination
    },
    [],
  )

  const triggerCompletePopup = useCallback(() => {
    setShowCompletePopup(true)

    if (completePopupTimerRef.current) {
      clearTimeout(completePopupTimerRef.current)
    }

    completePopupTimerRef.current = setTimeout(() => {
      setShowCompletePopup(false)
      completePopupTimerRef.current = null
    }, 3000)
  }, [])

  const dismissWarningPopup = useCallback(() => {
    setShowWarningPopup(false)
    setWarningNotice(null)
    if (warningPopupTimerRef.current) {
      clearTimeout(warningPopupTimerRef.current)
      warningPopupTimerRef.current = null
    }
  }, [])

  const dismissScanBlockPopup = useCallback(() => {
    setShowScanBlockPopup(false)
    if (scanBlockPopupTimerRef.current) {
      clearTimeout(scanBlockPopupTimerRef.current)
      scanBlockPopupTimerRef.current = null
    }
  }, [])

  const markCurrentSeqCompleted = useCallback(
    (source: 'ws' | 'api-fallback' | 'manual') => {
      if (!currentSeq) return

      logger.info('External completion detected', {
        source,
        recordId: currentSeq.recordId,
      })

      setSequences((prev) =>
        prev.filter((sequence) => sequence.id !== currentSeq.id),
      )
      setScanBarcode('')
      triggerCompletePopup()
      scanInputRef.current?.focus()

      fetchCompletedSequences().catch((error) => {
        handleError(error, { operation: `${source}FetchCompletedSequences` })
      })
    },
    [currentSeq, fetchCompletedSequences, triggerCompletePopup],
  )
  markCompletedRef.current = markCurrentSeqCompleted

  useEffect(() => {
    return () => {
      if (completePopupTimerRef.current) {
        clearTimeout(completePopupTimerRef.current)
      }

      if (warningPopupTimerRef.current) {
        clearTimeout(warningPopupTimerRef.current)
      }

      if (scanBlockPopupTimerRef.current) {
        clearTimeout(scanBlockPopupTimerRef.current)
      }
    }
  }, [])

  // Persist input mode
  useEffect(() => {
    try {
      if (typeof window !== 'undefined')
        localStorage.setItem('man-bracket-input-mode', inputMode)
    } catch {}
  }, [inputMode])

  // Reset form when input source changes
  useEffect(() => {
    setScanBarcode('')
    setSequences([])
    setShowWarningPopup(false)
    setWarningNotice(null)
  }, [inputMode])

  // Fetch completed sequences + stock on mount
  useEffect(() => {
    fetchCompletedSequences()
    fetchStock()
  }, [fetchCompletedSequences, fetchStock])

  // Realtime stock updates from TB_R_ANDON_GLOBAL
  useEffect(() => {
    const socket = getSocket()

    const handleStockUpdate = (payload: {
      stdStock?: number
      bufferStock?: number
    }) => {
      if (typeof payload?.stdStock === 'number') {
        setStdStock(payload.stdStock)
      }
      if (typeof payload?.bufferStock === 'number') {
        setActBufferStock(payload.bufferStock)
      }
    }

    socket.on('man-bracket:stock', handleStockUpdate)

    return () => {
      socket.off('man-bracket:stock', handleStockUpdate)
    }
  }, [])

  // Auto scroll + focus
  useEffect(() => {
    if (!isLoading) {
      if (inputMode !== 'serial') {
        scanInputRef.current?.focus()
      }
      completedListRef.current?.scrollTo({
        top: completedListRef.current.scrollHeight,
      })
    }
  }, [isLoading, inputMode])

  // Auto scroll completed list when items added
  useEffect(() => {
    if (completedSeqs.length === 0) return
    completedListRef.current?.scrollTo({
      top: completedListRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [completedSeqs.length])

  // Update current sequence destination when active destination changes
  useEffect(() => {
    setSequences((prev) =>
      prev.map((sequence) =>
        sequence.status === 'in-progress'
          ? {
              ...sequence,
              orderType: activeDestination,
              destination: activeDestination,
              lastUpdate: new Date(),
            }
          : sequence,
      ),
    )
  }, [activeDestination])

  const handleToggleInterlock = useCallback(
    async (password: string) => {
      const next = !interlockOn
      try {
        // Map destination to FID (ASSY=1, CKD=2)
        const fid = activeDestination === 'CKD' ? 2 : 1
        await manBracketApi.setInterlockMode(next, password, fid)

        setInterlockOn(next)
        if (typeof window !== 'undefined') {
          localStorage.setItem('man-bracket-dest-mode', next ? 'on' : 'off')
        }
      } catch (error: any) {
        // Extract error message from axios response
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Gagal mengubah mode interlock'
        throw new Error(errorMessage)
      }
      scanInputRef.current?.focus()
    },
    [interlockOn, activeDestination],
  )

  const handleSetManualDestination = useCallback((dest: Destination) => {
    setManualDestination(dest)
    try {
      if (typeof window !== 'undefined')
        localStorage.setItem('man-bracket-manual-dest', dest)
    } catch {}
    scanInputRef.current?.focus()
  }, [])

  const handleScanSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const barcode = (scanBarcode || serialScanRef.current).trim().toUpperCase()
      if (!barcode) {
        scanInputRef.current?.focus()
        return
      }

      if (currentSeq) {
        setShowScanBlockPopup(true)
        if (scanBlockPopupTimerRef.current) {
          clearTimeout(scanBlockPopupTimerRef.current)
        }
        scanBlockPopupTimerRef.current = setTimeout(() => {
          dismissScanBlockPopup()
        }, 3000)
        scanInputRef.current?.focus()
        return
      }

      const packPartBattery = extractPackPartBattery(barcode)
      const isManualServicePartWarning =
        !interlockOn &&
        activeDestination !== 'SERVICE PART' &&
        packPartBattery === 'F7030'

      const isManualServicePartMismatch =
        !interlockOn &&
        activeDestination === 'SERVICE PART' &&
        packPartBattery === 'F7040'

      if (isManualServicePartWarning || isManualServicePartMismatch) {
        const warningMessage = isManualServicePartMismatch
          ? 'THIS BARCODE IS FOR SERVICE PART - PREFIX F7030.'
          : 'THIS BARCODE IS FOR ASSY/CKD - PREFIX F7040.'

        if (warningPopupTimerRef.current) {
          clearTimeout(warningPopupTimerRef.current)
        }

        setWarningNotice(warningMessage)
        setShowWarningPopup(true)
        warningPopupTimerRef.current = setTimeout(() => {
          dismissWarningPopup()
        }, 3000)

        if (isManualServicePartWarning || isManualServicePartMismatch) {
          return
        }
      } else {
        setWarningNotice(null)
        setShowWarningPopup(false)
      }

      const resolvedDestination = await resolveDestinationFromBarcode(
        barcode,
        interlockOn
          ? ((await fetchAutoDestination()) ?? activeDestination)
          : activeDestination,
      )

      const seqNo =
        barcode.match(/(\d{7})$/)?.[1] ??
        String(scanCounterRef.current).padStart(7, '0')
      const now = new Date()

      try {
        logger.info('Starting man bracket process', {
          barcode,
          destination: resolvedDestination,
        })

        const recordId = await manBracketApi.startProcess({
          barcode,
          destination: resolvedDestination,
          startTime: now,
        })

        if (!recordId) {
          alert('Failed to save process. Please try again.')
          scanInputRef.current?.focus()
          return
        }

        setSequences((prev) => {
          const processType: OrderType = resolvedDestination

          const nextCurrent: Sequence = {
            id: `scan-${Date.now()}-${scanCounterRef.current}`,
            recordId,
            name: `SM ${seqNo} LI-688D ${barcode}`,
            seqNo,
            barcode,
            seqType: 'LI-688D',
            orderType: processType,
            status: 'in-progress',
            priority: 1,
            estimatedTime: 300,
            startTime: now,
            completedTime: undefined,
            isSelected: false,
            isMarked: false,
            lastUpdate: now,
            destination: processType,
          }

          return [...prev, nextCurrent]
        })

        scanCounterRef.current += 1
        serialScanRef.current = '' // clear ref
        setScanBarcode(barcode)
        scanInputRef.current?.focus()

        logger.info('Process started successfully', { recordId })
      } catch (error) {
        handleError(error, { operation: 'startProcess' })
        alert('Error saving process. Please try again.')
        scanInputRef.current?.focus()
      }
    },
    [
      scanBarcode,
      currentSeq,
      interlockOn,
      activeDestination,
      fetchAutoDestination,
      resolveDestinationFromBarcode,
    ],
  )
  handleScanSubmitRef.current = handleScanSubmit

  const handleResetProcess = useCallback(async () => {
    if (!currentSeq?.recordId) {
      setScanBarcode('')
      scanInputRef.current?.focus()
      return
    }

    try {
      logger.info('Resetting process', { recordId: currentSeq.recordId })

      await manBracketApi.resetProcess(currentSeq.recordId)

      setSequences((prev) =>
        prev.filter((sequence) => sequence.id !== currentSeq.id),
      )
      setScanBarcode('')
      scanInputRef.current?.focus()

      logger.info('Process reset successfully')
    } catch (error) {
      handleError(error, { operation: 'resetProcess' })
      alert('Error resetting process. Please try again.')
      scanInputRef.current?.focus()
    }
  }, [currentSeq])

  const handleCompleteProcess = useCallback(async () => {
    if (!currentSeq?.recordId) return

    setIsSubmitting(true)
    try {
      logger.info('Completing process', { recordId: currentSeq.recordId })

      await manBracketApi.completeProcess({
        recordId: currentSeq.recordId,
        completedTime: new Date(),
      })

      markCurrentSeqCompleted('manual')

      logger.info('Process completed successfully')
    } catch (error) {
      handleError(error, { operation: 'completeProcess' })
      alert('Error saving process. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [currentSeq, markCurrentSeqCompleted])

  useEffect(() => {
    const socket = getSocket()
    subscribeRoom('man-bracket')

    const handleManBracketUpdate = (payload: ManBracketSocketPayload) => {
      const seq = currentSeqRef.current
      if (!interlockOn || !seq?.recordId) return

      const currentRecord = payload.records?.find(
        (record) => Number(record.FID) === Number(seq.recordId),
      )

      if (!currentRecord || Number(currentRecord.FVALUE) !== 1) return

      markCompletedRef.current?.('ws')
    }

    socket.on('man-bracket:update', handleManBracketUpdate)

    return () => {
      socket.off('man-bracket:update', handleManBracketUpdate)
      unsubscribeRoom('man-bracket')
    }
  }, [interlockOn])

  useEffect(() => {
    if (connected || !interlockOn || !currentSeq?.recordId) return

    let cancelled = false

    const syncActiveRecord = async () => {
      const seq = currentSeqRef.current
      if (!seq?.recordId) return
      try {
        const record = await manBracketApi.getRecord(seq.recordId)
        if (cancelled || !record) return

        if (Number(record.FVALUE) === 1) {
          markCompletedRef.current?.('api-fallback')
        }
      } catch (error) {
        if (!cancelled) {
          logger.debug('Fallback sync failed', {
            recordId: seq.recordId,
          })
        }
      }
    }

    syncActiveRecord()
    const intervalId = setInterval(syncActiveRecord, 1500)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [connected, interlockOn, currentSeq?.recordId, markCurrentSeqCompleted])

  useEffect(() => {
    if (inputMode !== 'serial') return

    const socket = getSocket()

    const handleSerialScan = (payload: { barcode: string }) => {
      if (!payload?.barcode) return
      logger.info('Serial scan received', { barcode: payload.barcode })

      // Write to ref so handleScanSubmit can read it (avoids stale closure)
      serialScanRef.current = payload.barcode.toUpperCase()
      const mockEvent = {
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>
      setScanBarcode(payload.barcode.toUpperCase())
      handleScanSubmitRef.current?.(mockEvent).catch((error) => {
        logger.error('Auto-submit from serial scan failed', error)
      })
    }

    socket.on('man-bracket:serial-scan', handleSerialScan)

    return () => {
      socket.off('man-bracket:serial-scan', handleSerialScan)
    }
  }, [inputMode])

  return {
    sequences,
    completedSeqs,
    completedCounts,
    isLoading,
    isSubmitting,
    showCompletePopup,
    showWarningPopup,
    showScanBlockPopup,
    scanBarcode,
    warningNotice,
    interlockOn,
    manualDestination,
    autoDestination,
    showSettings,
    inputMode,
    scanInputRef,
    completedListRef,
    currentSeq,
    activeDestination,
    stdStock,
    actBufferStock,

    setScanBarcode,
    setInterlockOn,
    setManualDestination,
    setShowSettings,
    setInputMode,

    fetchCompletedSequences,
    fetchStock,
    fetchAutoDestination,
    handleToggleInterlock,
    handleSetManualDestination,
    handleScanSubmit,
    handleResetProcess,
    handleCompleteProcess,
  }
}
