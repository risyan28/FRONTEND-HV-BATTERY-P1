'use client'

import { motion } from 'framer-motion'
import { Bold } from 'lucide-react'

export function Footer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className='w-full py-4 pb-20 md:pb-4 text-center text-xs md:text-sm text-gray-500'
    >
      <p className='px-4'>
        ● {new Date().getFullYear()} HEV BATTERY P1 Dashboard ● Development by{' '}
        <a
          href='https://adaptive.co.id'
          style={{
            color: '#1f6eff',
            textDecoration: 'underline',
          }}
          target='_blank'
          rel='noopener noreferrer'
        >
          Adaptive Automation System
        </a>{' '}
        ●
      </p>
    </motion.div>
  )
}
