'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Sequence } from '@/types/sequence'

interface ParkedSequencesProps {
  parkedSequences: Sequence[]
  onInsert: (
    parkedIndex: number,
    payload: { anchorId?: number; position?: 'beginning' | 'end' }
  ) => void
  onRemove: (index: number) => void
  queueSequences?: Sequence[]
}

export function ParkedSequences({
  parkedSequences,
  onInsert,
  onRemove,
  queueSequences = [],
}: ParkedSequencesProps) {
  const [showPositionDialog, setShowPositionDialog] = useState(false)
  const [selectedParkedIndex, setSelectedParkedIndex] = useState<number | null>(
    null
  )
  const [selectedAnchorId, setSelectedAnchorId] = useState<string>('')

  const handleInsertClick = (parkedIndex: number) => {
    setSelectedParkedIndex(parkedIndex)
    setSelectedAnchorId('')
    setShowPositionDialog(true)
  }

  const handleConfirmInsert = () => {
    if (selectedParkedIndex !== null) {
      let payload: { anchorId?: number; position?: 'beginning' | 'end' } = {}

      if (selectedAnchorId === 'beginning') {
        payload.position = 'beginning'
      } else if (selectedAnchorId === 'end') {
        payload.position = 'end'
      } else {
        payload.anchorId = Number(selectedAnchorId)
      }

      onInsert(selectedParkedIndex, payload)
      setShowPositionDialog(false)
      setSelectedParkedIndex(null)
      setSelectedAnchorId('')
    }
  }

  return (
    <>
      <div className='flex-[2] rounded-md border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden'>
        <div className='p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'>
          <h3 className='font-medium text-gray-900'>Parked Sequences</h3>
          <p className='text-sm text-gray-500'>
            Sequences temporarily removed from queue
          </p>
        </div>
        <div className='max-h-[calc(100vh-230px)] overflow-y-auto'>
          <AnimatePresence>
            {parkedSequences.map((seq, index) => (
              <motion.div
                key={`parked-${seq.FID}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className='p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200'
              >
                {/* Seq & Model */}
                <div className='flex justify-between'>
                  <div>
                    <span className='text-md text-muted-foreground'>
                      No Seq:
                    </span>
                    <span className='ml-1 font-mono font-semibold'>
                      {seq.FBARCODE?.slice(-7)}
                    </span>
                  </div>
                  <div>
                    <span className='text-md text-muted-foreground'>Type:</span>
                    <span className='ml-1 font-bold'>{seq.FMODEL_BATTERY}</span>
                  </div>
                </div>

                {/* Barcode */}
                <div className='mt-2 flex justify-between'>
                  <div>
                    <span className='text-md text-muted-foreground'>
                      Barcode:
                    </span>
                    <span className='ml-1 font-mono text-md font-bold'>
                      {seq.FBARCODE}
                    </span>
                  </div>
                </div>
                <div className='flex  mt-3 justify-center items-center gap-2'>
                  <Button
                    variant='ghost'
                    onClick={() => handleInsertClick(index)}
                    className='px-2 py-1 h-auto bg-black text-white hover:bg-black hover:text-white cursor-pointer text-md'
                    title='Insert to queue'
                  >
                    <ArrowLeft className='h-4 w-4 mr-1 text-white' />
                    INSERT SEQ
                  </Button>
                  <Button
                    className='px-2 py-1 h-auto bg-red-500 text-white hover:bg-red-500 hover:text-white cursor-pointer text-md'
                    variant='ghost'
                    onClick={() => onRemove(index)}
                    title='Remove from parked'
                  >
                    <X className='h-4 w-4 mr-1' />
                    DELETE SEQ
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {parkedSequences.length === 0 && (
            <div className='p-8 text-center text-gray-500'>
              <div className='text-sm'>No parked sequences</div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showPositionDialog} onOpenChange={setShowPositionDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Choose Insert Position</DialogTitle>
            <DialogDescription>
              Select where you want to insert the sequence:
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <Select
              value={selectedAnchorId}
              onValueChange={setSelectedAnchorId}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select position' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='beginning'>At the Fisrt</SelectItem>
                {queueSequences?.map((seq) => (
                  <SelectItem key={seq.FID} value={seq.FID.toString()}>
                    Before {seq.FBARCODE}
                  </SelectItem>
                ))}
                <SelectItem value='end'>At the end</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowPositionDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmInsert} disabled={!selectedAnchorId}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
