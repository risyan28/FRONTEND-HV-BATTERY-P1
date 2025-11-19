import {
  ClipboardList,
  CheckCircle,
  BarChart2,
  TimerOff,
  Target,
} from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
  target: number
  plan: number
  actual: number
  effPct: number
  downtime: number
}

export function RealtimeStats({ target, plan, actual, effPct, downtime }: Props) {
  return (
    <div className='mb-4 bg-white rounded-lg'>
      <div className='container mx-auto px-4 py-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Realtime Monitoring</h2>
        </div>

        {/* Mobile View */}
        <div className='block md:hidden'>
          <div className='grid gap-4'>
            <div className='grid grid-cols-3 gap-4'>
              {/* Target */}
              <div className='rounded-lg bg-sky-100 p-4'>
                <div className='mb-2 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-sky-200'>
                    <Target className='h-5 w-5 text-sky-800' />
                  </div>
                  <span className='text-sm font-medium'>Target</span>
                </div>
                <p className='text-lg font-bold text-sky-800'>{target} Units</p>
                <p className='text-xs text-gray-500'>Today</p>
              </div>

              {/* Plan */}
              <div className='rounded-lg bg-slate-100 p-4'>
                <div className='mb-2 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-200'>
                    <ClipboardList className='h-5 w-5 text-slate-700' />
                  </div>
                  <span className='text-sm font-medium'>Plan</span>
                </div>
                <p className='text-lg font-bold text-slate-700'>{plan} Units</p>
                <p className='text-xs text-gray-500'>Today</p>
              </div>

              {/* Actual */}
              <div className='rounded-lg bg-green-100 p-4'>
                <div className='mb-2 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-200'>
                    <CheckCircle className='h-5 w-5 text-green-600' />
                  </div>
                  <span className='text-sm font-medium'>Actual</span>
                </div>
                <p className='text-lg font-bold text-green-600'>
                  {actual} Units
                </p>
                <p className='text-xs text-gray-500'>Today</p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              {/* Efficiency */}
              <div className='rounded-lg bg-yellow-100 p-4'>
                <div className='mb-2 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200'>
                    <BarChart2 className='h-5 w-5 text-yellow-600' />
                  </div>
                  <span className='text-sm font-medium'>Efficiency</span>
                </div>
                <p className='text-lg font-bold text-yellow-600'>{effPct} %</p>
                <p className='text-xs text-gray-500'>Today</p>
              </div>

              {/* Downtime */}
              <div className='rounded-lg bg-red-100 p-4'>
                <div className='mb-2 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-200'>
                    <TimerOff className='h-5 w-5 text-red-600' />
                  </div>
                  <span className='text-sm font-medium'>Total Downtime</span>
                </div>
                <p className='text-lg font-bold text-red-600'>
                  {downtime} Minutes
                </p>
                <p className='text-xs text-gray-500'>Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className='hidden cursor-pointer md:grid md:grid-cols-5 md:gap-5'>
          {/* Plan */}
          <motion.div
            className='w-full'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className='rounded-lg bg-sky-100 p-4'>
              <div className='mb-2 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-sky-200'>
                  <Target className='h-5 w-5 text-sky-800' />
                </div>
                <span className='text-sm font-medium'>Target</span>
              </div>
              <p className='text-lg font-bold text-sky-800'>{target} Units</p>
              <p className='text-xs text-gray-500'>Today</p>
            </div>
          </motion.div>

          {/* Plan */}
          <motion.div
            className='w-full'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className='rounded-lg bg-slate-100 p-4'>
              <div className='mb-2 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-200'>
                  <ClipboardList className='h-5 w-5 text-slate-700' />
                </div>
                <span className='text-sm font-medium'>Plan</span>
              </div>
              <p className='text-lg font-bold text-slate-700'>{plan} Units</p>
              <p className='text-xs text-gray-500'>Today</p>
            </div>
          </motion.div>

          {/* Actual */}
          <motion.div
            className='w-full'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className='rounded-lg bg-green-100 p-4'>
              <div className='mb-2 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-200'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                </div>
                <span className='text-sm font-medium'>Actual</span>
              </div>
              <p className='text-lg font-bold text-green-600'>{actual} Units</p>
              <p className='text-xs text-gray-500'>Today</p>
            </div>
          </motion.div>

          {/* Efficiency */}
          <motion.div
            className='w-full'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className='rounded-lg bg-yellow-100 p-4'>
              <div className='mb-2 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200'>
                  <BarChart2 className='h-5 w-5 text-yellow-600' />
                </div>
                <span className='text-sm font-medium'>Efficiency</span>
              </div>
              <p className='text-lg font-bold text-yellow-600'>{effPct} %</p>
              <p className='text-xs text-gray-500'>Today</p>
            </div>
          </motion.div>

          {/* Downtime */}
          <motion.div
            className='w-full'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className='rounded-lg bg-red-100 p-4'>
              <div className='mb-2 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-200'>
                  <TimerOff className='h-5 w-5 text-red-600' />
                </div>
                <span className='text-sm font-medium'>Total Downtime</span>
              </div>
              <p className='text-lg font-bold text-red-600'>
                {downtime} Minutes
              </p>
              <p className='text-xs text-gray-500'>Today</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
