import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { AppHeader } from '@/components/app-header'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingScreen } from '@/components/loading-screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, AlertCircle } from 'lucide-react'

type OrderType = 'ASSY' | 'CKD' | 'SERVICE PART'

interface Sequence {
  id: string
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
  isSelected: boolean
  isMarked: boolean
  lastUpdate: Date
}

const ORDER_TYPES: OrderType[] = ['ASSY', 'CKD', 'SERVICE PART']

const TYPE_STYLE: Record<
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

const randomOrderType = (): OrderType =>
  ORDER_TYPES[Math.floor(Math.random() * ORDER_TYPES.length)]

function generateData(): Sequence[] {
  return []
}

export function ManBracketPage(): React.ReactElement {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [scanBarcode, setScanBarcode] = useState('')
  const scanInputRef = useRef<HTMLInputElement | null>(null)
  const completedListRef = useRef<HTMLDivElement | null>(null)
  const scanCounterRef = useRef(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSequences(generateData())
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      scanInputRef.current?.focus()
      completedListRef.current?.scrollTo({ top: completedListRef.current.scrollHeight })
    }
  }, [isLoading])

  const currentSeq = sequences.find((s) => s.status === 'in-progress') ?? null
  const completedSeqs = sequences.filter((s) => s.status === 'completed')

  useEffect(() => {
    if (completedSeqs.length === 0) return
    completedListRef.current?.scrollTo({
      top: completedListRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [completedSeqs.length])

  const completedByType = ORDER_TYPES.reduce(
    (acc, t) => {
      acc[t] = completedSeqs.filter((s) => s.orderType === t).length
      return acc
    },
    {} as Record<OrderType, number>,
  )

  const handleScanSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const barcode = scanBarcode.trim().toUpperCase()
    if (!barcode) {
      scanInputRef.current?.focus()
      return
    }

    const seqNo = barcode.match(/(\d{7})$/)?.[1] ?? String(scanCounterRef.current).padStart(7, '0')
    const now = new Date()

    setSequences((prev) => {
      const current = prev.find((s) => s.status === 'in-progress')
      const moved = current
        ? prev.map((s) =>
            s.id === current.id
              ? { ...s, status: 'completed' as const, completedTime: now }
              : s,
          )
        : prev

      const nextCurrent: Sequence = {
        id: `scan-${Date.now()}-${scanCounterRef.current}`,
        name: `SM ${seqNo} LI-688D ${barcode}`,
        seqNo,
        barcode,
        seqType: 'LI-688D',
        orderType: randomOrderType(),
        status: 'in-progress',
        priority: 1,
        estimatedTime: 300,
        startTime: now,
        completedTime: undefined,
        isSelected: false,
        isMarked: false,
        lastUpdate: now,
      }

      return [...moved, nextCurrent]
    })

    scanCounterRef.current += 1
    setScanBarcode(barcode)
    scanInputRef.current?.focus()
  }

  const handleClearScan = () => {
    setScanBarcode('')
    scanInputRef.current?.focus()
  }

  return (
    <div className='flex h-screen flex-col bg-zinc-100 overflow-hidden'>
      {isLoading && <LoadingScreen />}
      {!isLoading && (
        <div className='flex flex-1 flex-col w-full min-h-0'>
          {/* Header */}
          <AppHeader
            title='MAN BRACKET - HEV BATTERY'
            className='h-16 md:h-16'
          />

          {/* Body */}
          <div className='flex flex-1 min-h-0 overflow-hidden p-1 gap-1'>
            {/* LEFT: Processing Now */}
            <motion.div
              className='flex-1 flex flex-col gap-1 min-h-0'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <form
                onSubmit={handleScanSubmit}
                className='bg-white rounded-lg shadow border border-slate-200 px-3 sm:px-5 py-2 flex items-center gap-3 flex-shrink-0'
              >
                <label
                  htmlFor='scan-barcode'
                  className='text-2xl sm:text-3xl font-bold text-slate-700 whitespace-nowrap'
                >
                  Scan Barcode
                </label>
                <Input
                  id='scan-barcode'
                  ref={scanInputRef}
                  value={scanBarcode}
                  onChange={(event) => setScanBarcode(event.target.value)}
                  placeholder='Scan or type barcode...'
                  autoFocus
                  className='h-16 sm:h-16 !text-3xl sm:!text-3xl md:!text-4xl !font-black !leading-none !bg-white dark:!bg-white !text-black dark:!text-black placeholder:!text-slate-500'
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    WebkitTextFillColor: '#000000',
                  }}
                />
                <Button
                  type='button'
                  onClick={handleClearScan}
                  className='h-14 sm:h-16 px-6 sm:px-8 text-xl sm:text-2xl font-bold bg-slate-200 text-slate-900 hover:bg-slate-300'
                >
                  Clear
                </Button>
                <Button
                  type='submit'
                  className='h-14 sm:h-16 px-6 sm:px-8 text-xl sm:text-2xl font-bold bg-slate-900 text-white hover:bg-slate-800'
                >
                  Enter
                </Button>
              </form>

              <div className='flex-1 bg-white rounded-lg shadow border border-slate-200 flex flex-col overflow-hidden'>
                <div className='flex items-center justify-between px-3 py-2 flex-shrink-0'>
                  <h2 className='text-lg sm:text-2xl font-bold text-slate-700'>
                    Processing Now
                  </h2>
                </div>

                <div className='flex-1 flex justify-center bg-yellow-400 items-center rounded-md mx-10 my-10 mb-10 text-center px-4 py-2'>
                  {currentSeq ? (
                    <div className='text-center'>
                      {currentSeq.orderType === 'SERVICE PART' ? (
                        <div className='font-black text-black tracking-widest leading-none flex flex-col items-center' style={{ fontSize: 'clamp(3rem, 14vw, 16rem)' }}>
                          <span>SERVICE</span>
                          <span>PART</span>
                        </div>
                      ) : (
                        <div className='font-black text-black tracking-widest' style={{ fontSize: 'clamp(8rem, 25vw, 25rem)', lineHeight: 1 }}>
                          {currentSeq.orderType}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='bg-slate-50 rounded-xl p-4 sm:p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 h-full flex flex-col justify-center w-full'>
                      <AlertCircle className='w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-slate-300' />
                      <div className='text-lg sm:text-xl font-medium mb-2'>
                        No sequence in progress
                      </div>
                      <div className='text-sm sm:text-base'>
                        Mark sequences from the queue to begin processing
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Sidebar — Queue + Completed+Resume */}
            <motion.div
              className='w-[260px] sm:w-[340px] lg:w-[420px] xl:w-[480px] flex flex-col gap-1 min-h-0'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Completed + Resume Section (merged) */}
              <div className='flex-1 bg-white rounded-lg shadow border border-slate-200 flex flex-col overflow-hidden min-h-0'>
                <div className='bg-green-600 text-white p-1 md:p-2 flex justify-between items-center h-7 md:h-9 sticky top-0 z-10'>
                  <h3 className='font-bold text-white text-2xl'>
                    Completed Sequence
                  </h3>
                </div>

                <div
                  ref={completedListRef}
                  className='flex-1 overflow-y-auto p-1.5 space-y-1'
                >
                  <AnimatePresence>
                    {completedSeqs.map((seq, idx) => (
                      <motion.div
                        key={seq.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className='bg-muted rounded-lg p-2 md:p-3 border-l-4 border-green-500 shadow-sm mt-3 mb-3'
                      >
                        <div className='flex items-center justify-between mb-0.5'>
                          <span className='text-sm text-slate-500'>
                            No Seq:{' '}
                            <span className='font-bold text-slate-800'>
                              {seq.seqNo}
                            </span>
                          </span>
                          <span className='text-sm text-slate-500'>
                            Type:{' '}
                            <span className='font-bold text-slate-800'>
                              {seq.seqType}
                            </span>
                          </span>
                        </div>
                        <div className='text-sm text-slate-500 mb-0.5'>
                          Barcode:{' '}
                          <span className='font-bold text-slate-800'>
                            {seq.barcode}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-slate-500'>
                            Time Complete:{' '}
                            <span className='font-bold text-emerald-700'>
                              {seq.completedTime?.toLocaleTimeString('en-US', {
                                hour12: false,
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </span>
                          <span
                            className={`text-sm font-bold px-1.5 py-0.5 rounded text-white ${TYPE_STYLE[seq.orderType].badge}`}
                          >
                            {seq.orderType}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* RESUME — inside completed section */}
                <div className='flex-shrink-0 border-t border-slate-200'>
                  <div className='px-2 py-1 bg-slate-800 text-slate-100 text-xl sm:text-2xl font-bold tracking-wider'>
                    RESUME
                  </div>
                  <div className='flex gap-2 p-2'>
                    {ORDER_TYPES.map((type) => (
                      <div
                        key={type}
                        className='flex-1 bg-slate-100 border border-slate-400 p-2 sm:p-3 rounded-lg text-center shadow-sm'
                      >
                        <div className='text-md sm:text-md font-bold text-slate-700 tracking-wide'>
                          {type}
                        </div>
                        <div className='text-xl sm:text-5xl font-extrabold leading-none text-slate-900 mt-1'>
                          {completedByType[type]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
