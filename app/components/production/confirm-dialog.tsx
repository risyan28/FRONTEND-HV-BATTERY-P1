'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ConfirmDialogState } from '@/types/sequence'

interface ConfirmDialogProps {
  confirmDialog: ConfirmDialogState
  onClose: () => void
}

export function ConfirmDialog({ confirmDialog, onClose }: ConfirmDialogProps) {
  const handleConfirm = () => {
    confirmDialog.action()
    onClose()
  }

  return (
    <Dialog open={confirmDialog.open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogDescription>{confirmDialog.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
