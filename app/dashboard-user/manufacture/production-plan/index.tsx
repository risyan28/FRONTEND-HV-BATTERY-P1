'use client'

import { motion } from 'framer-motion'
import { useSequenceManagement } from '@/hooks/use-sequence-management'
import { PageHeader } from '@/components/production/page-header'
import { SequenceTable } from '@/components/production/sequence-table'
import { ParkedSequences } from '@/components/production/parked-sequences'
import { ConfirmDialog } from '@/components/production/confirm-dialog'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'

export function ProductionPlanPage() {
  const {
    sequences,
    loading,
    error,
    confirmDialog,
    closeConfirmDialog,
    moveSequenceUp,
    moveSequenceDown,
    parkSequence,
    insertSequence,
    removeFromParked,
    refetch,
    highlightedId,
    onAddManualSeq,
  } = useSequenceManagement()

  // ✅ Error state inline
  if (error) {
    return (
      <div className='max-w-2xl mx-auto w-full px-4 py-8'>
        <div className='flex flex-col items-center justify-center min-h-[400px] text-center space-y-4'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Failed to load production data
          </h3>
          <p className='text-gray-600 max-w-md'>{error}</p>
          <Button onClick={refetch} className='mt-4'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-8xl mx-auto w-full px-2 py-4 sm:px-4 sm:py-6 lg:px-4'>
      <PageHeader isLoading={loading} title='Production Sequence Control' />

      {/* Main Content Area */}
      {loading ? (
        <div className='flex-1 px-4 sm:px-6 lg:px-8'>
          <div className='h-full rounded-xl bg-gray-200 animate-pulse' />
        </div>
      ) : (
        <div className='flex-1 flex gap-2 px-2 sm:px-4 lg:px-0 pb-4 overflow-hidden'>
          {/* Active Queue - 80% */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className='flex-8 rounded-md border border-gray-100 bg-white/80 p-4 shadow-sm'
          >
            <SequenceTable
              sequences={
                sequences ?? {
                  current: null,
                  queue: [],
                  completed: [],
                  parked: [],
                }
              }
              onMoveUp={moveSequenceUp}
              onMoveDown={moveSequenceDown}
              onPark={parkSequence}
              highlightedId={highlightedId}
              AddManualSeq={onAddManualSeq}
            />
          </motion.div>

          {/* Parked Sequences - 20% */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <ParkedSequences
              parkedSequences={sequences?.parked ?? []}
              onInsert={insertSequence}
              onRemove={removeFromParked}
              queueSequences={sequences?.queue ?? []}
            />
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        confirmDialog={confirmDialog}
        onClose={closeConfirmDialog}
      />
    </div>
  )
}
