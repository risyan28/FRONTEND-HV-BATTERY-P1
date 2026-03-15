import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

type ManualOrderType = 'ASSY' | 'CKD' | 'SERVICE PART'

interface SequenceTableHeaderProps {
  addManualSeq: (orderType: ManualOrderType, qty: number) => void
}

export function SequenceTableHeader({
  addManualSeq,
}: SequenceTableHeaderProps) {
  const [open, setOpen] = useState(false)
  const [orderType, setOrderType] = useState<ManualOrderType>('ASSY')
  const [qty, setQty] = useState(1)

  const handleConfirm = () => {
    addManualSeq(orderType, qty)
    setOpen(false)
  }

  return (
    <>
      <div className='mb-3 md:mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3'>
        {/* Left - Legend */}
        <div className='flex items-center gap-2 md:gap-4 flex-wrap'>
          <div className='flex items-center'>
            <div className='mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 bg-yellow-400'></div>
            <span className='text-xs md:text-sm'>Current</span>
          </div>
          <div className='flex items-center'>
            <div className='mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 bg-green-500'></div>
            <span className='text-xs md:text-sm'>History</span>
          </div>
          <div className='flex items-center'>
            <div className='mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 bg-slate-300'></div>
            <span className='text-xs md:text-sm'>Next Sequence</span>
          </div>
        </div>

        {/* Right - Add Button */}
        <button
          onClick={() => setOpen(true)}
          className='flex items-center gap-1.5 md:gap-2 rounded-lg bg-black px-2 md:px-3 py-1.5 md:py-1 text-xs md:text-sm text-white h-8 md:h-10 cursor-pointer whitespace-nowrap'
        >
          <Plus size={14} className='md:w-4 md:h-4' />
          <span className='hidden sm:inline'>Add Manual Sequence</span>
          <span className='sm:hidden'>Add Manual</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Sequence Injection</DialogTitle>
            <Separator className='my-1' />
            <DialogDescription>
              Select the ORDER TYPE and sequence QTY to inject.
            </DialogDescription>
          </DialogHeader>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Order Type</label>
              <Select
                value={orderType}
                onValueChange={(v) => setOrderType(v as ManualOrderType)}
              >
                <SelectTrigger className='h-10 w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ASSY'>ASSY</SelectItem>
                  <SelectItem value='CKD'>CKD</SelectItem>
                  <SelectItem value='SERVICE PART'>SERVICE PART</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>QTY</label>
              <input
                type='number'
                min={1}
                max={200}
                value={qty}
                onChange={(e) =>
                  setQty(
                    Math.max(1, Math.min(200, Number(e.target.value) || 1)),
                  )
                }
                className='h-10 w-full rounded-md border px-3 text-sm'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm Inject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
