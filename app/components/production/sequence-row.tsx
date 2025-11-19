'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, MoveRight } from 'lucide-react'
import type { Sequence } from '@/types/sequence'

interface SequenceRowProps {
  sequence: Sequence
  type: 'completed' | 'current' | 'queue'
  index?: number
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
  onPark?: (index: number) => void
  highlightedId?: number | null
  queueLength?: number
}

export function SequenceRow({
  sequence,
  type,
  index = 0,
  onMoveUp,
  onMoveDown,
  onPark,
  highlightedId,
  queueLength = 0,
}: SequenceRowProps) {
  const getRowStyle = () => {
    switch (type) {
      case 'completed':
        return 'border-b border-gray-100 bg-gradient-to-r from-green-400/90 to-green-500/90 text-white'
      case 'current':
        return 'border-b border-gray-100 bg-gradient-to-r from-yellow-300/90 to-yellow-400/90 text-black'
      case 'queue':
        return 'border-b border-gray-100 bg-gradient-to-r from-gray-200/90 to-gray-300/90 hover:from-gray-300/90 hover:to-gray-400/90 transition-all duration-200'
      default:
        return ''
    }
  }

  const getStatusBadge = () => {
    switch (type) {
      case 'completed':
        return (
          <Badge className='bg-green-700/80 hover:bg-green-800/80 text-white text-xs'>
            COMPLETED
          </Badge>
        )
      case 'current':
        return (
          <Badge className='bg-yellow-600/80 hover:bg-yellow-700/80 text-white text-xs'>
            RUNNING
          </Badge>
        )
      case 'queue':
        return (
          <Badge
            variant='secondary'
            className='bg-gray-500/80 hover:bg-gray-600/80 text-white text-xs'
          >
            QUEUED
          </Badge>
        )
      default:
        return null
    }
  }

  const getActions = () => {
    if (type !== 'queue') {
      return <td className='px-4 py-3 text-center'>-</td>
    }

    return (
      <td className='px-4 py-3 text-left'>
        <div className='flex items-center justify-center gap-1'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onMoveDown?.(index)}
            disabled={index === queueLength - 1}
            className='h-8 w-8 p-0'
          >
            <ArrowUp className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onMoveUp?.(index)}
            disabled={index === 0}
            className='h-8 w-8 p-0'
          >
            <ArrowDown className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onPark?.(index)}
            className='h-8 w-8 p-0'
          >
            <MoveRight className='h-4 w-4' />
          </Button>
        </div>
      </td>
    )
  }

  return (
    <motion.tr
      className={getRowStyle()}
      initial='hidden'
      animate={highlightedId ? 'highlighted' : 'normal'}
      variants={{
        hidden: { opacity: 0 },
        normal: { opacity: 1, backgroundColor: '#ffff' },
        highlighted: { opacity: 1, backgroundColor: '#fcd742' },
      }}
    >
      <td className='px-6 py-3 text-left'>{sequence.FBARCODE?.slice(-7)}</td>
      <td className='px-4 py-3 text-left'>{sequence.FMODEL_BATTERY}</td>
      <td className='px-4 py-3 font-mono text-sm text-left'>
        {sequence.FSEQ_K0}
      </td>
      <td className='px-4 py-3 text-left'>{sequence.FBODY_NO_K0}</td>
      <td className='px-4 py-3 font-mono text-sm text-left'>
        {sequence.FBARCODE}
      </td>
      <td className='px-4 py-3 text-center'>{sequence.FALC_DATA}</td>
      <td className='px-4 py-3 text-sm text-left'>{sequence.FTIME_RECEIVED}</td>
      <td className='px-4 py-3 text-sm text-left'>{sequence.FTIME_PRINTED}</td>
      <td className='px-4 py-3 text-left'>{getStatusBadge()}</td>
      {getActions()}
    </motion.tr>
  )
}
