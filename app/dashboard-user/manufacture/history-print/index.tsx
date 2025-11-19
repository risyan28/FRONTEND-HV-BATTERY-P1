'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/production/page-header'
import { HistoryPrintLabel } from './history-print'

export function HistoryPrint() {
  return (
    <div className='max-w-8xl mx-auto w-full px-2 py-4 sm:px-4 sm:py-6 lg:px-4'>
      <PageHeader isLoading={false} title='History Printing' />

      {/* Main Content Area */}
      <div className='flex-1 flex gap-2 px-2 sm:px-4 lg:px-0 pb-4 overflow-hidden'>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className='flex-[8] rounded-md border border-gray-100 bg-white/80 p-4 shadow-sm'
        >
          <HistoryPrintLabel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        ></motion.div>
      </div>

      {/* Confirmation Dialog */}
      {/* <ConfirmDialog
        confirmDialog={confirmDialog}
        onClose={closeConfirmDialog}
      /> */}
    </div>
  )
}
