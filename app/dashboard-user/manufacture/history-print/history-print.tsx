'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Printer, Eye } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import type { ColumnDef } from '@tanstack/react-table'

// Sample data type - replace with your actual data structure
interface PrintHistory {
  id: string
  fileName: string
  printDate: string
  status: 'completed' | 'failed' | 'pending'
  pages: number
  size: string
  user: string
  printer: string
}

// Sample data - replace with your actual data fetching
const sampleData: PrintHistory[] = [
  {
    id: '1',
    fileName: 'Document_Report_2024.pdf',
    printDate: '2024-01-15 14:30:25',
    status: 'completed',
    pages: 25,
    size: '2.4 MB',
    user: 'John Doe',
    printer: 'HP LaserJet Pro',
  },
  {
    id: '2',
    fileName: 'Invoice_12345.pdf',
    printDate: '2024-01-15 13:45:12',
    status: 'failed',
    pages: 3,
    size: '1.2 MB',
    user: 'Jane Smith',
    printer: 'Canon PIXMA',
  },
  {
    id: '3',
    fileName: 'Presentation_Q1.pptx',
    printDate: '2024-01-15 12:20:08',
    status: 'completed',
    pages: 45,
    size: '15.7 MB',
    user: 'Mike Johnson',
    printer: 'Epson WorkForce',
  },
  {
    id: '4',
    fileName: 'Budget_Analysis.xlsx',
    printDate: '2024-01-15 11:15:33',
    status: 'pending',
    pages: 8,
    size: '5.1 MB',
    user: 'Sarah Wilson',
    printer: 'HP LaserJet Pro',
  },
  {
    id: '5',
    fileName: 'Contract_Template.docx',
    printDate: '2024-01-15 10:30:45',
    status: 'completed',
    pages: 12,
    size: '890 KB',
    user: 'David Brown',
    printer: 'Canon PIXMA',
  },
]

export function HistoryPrintLabel() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PrintHistory[]>([])

  // Define table columns with sorting and customization
  const columns: ColumnDef<PrintHistory>[] = useMemo(
    () => [
      {
        accessorKey: 'fileName',
        header: 'File Name',
        cell: ({ row }) => (
          <div className='flex items-center space-x-2'>
            <div className='min-w-0 flex-1'>
              <p className='font-medium text-foreground truncate'>
                {row.getValue('fileName')}
              </p>
              <p className='text-sm text-muted-foreground'>
                {row.original.size}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'printDate',
        header: 'Print Date',
        cell: ({ row }) => (
          <div className='text-sm'>
            <div className='font-medium'>
              {new Date(row.getValue('printDate')).toLocaleDateString()}
            </div>
            <div className='text-muted-foreground'>
              {new Date(row.getValue('printDate')).toLocaleTimeString()}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return (
            <Badge
              variant={
                status === 'completed'
                  ? 'default'
                  : status === 'failed'
                    ? 'destructive'
                    : 'secondary'
              }
              className='capitalize'
            >
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'pages',
        header: 'Pages',
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('pages')} pages</span>
        ),
      },
      {
        accessorKey: 'user',
        header: 'User',
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('user')}</span>
        ),
      },
      {
        accessorKey: 'printer',
        header: 'Printer',
        cell: ({ row }) => (
          <span className='text-muted-foreground'>
            {row.getValue('printer')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center space-x-2'>
            <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
              <Eye className='h-4 w-4' />
            </Button>
            <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
              <Download className='h-4 w-4' />
            </Button>
            <Button
              size='sm'
              variant='ghost'
              className='h-8 w-8 p-0'
              disabled={row.original.status !== 'completed'}
            >
              <Printer className='h-4 w-4' />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  // load data sederhana dari sampleData
  const loadData = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setData(sampleData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <>
      {/* Main Content Area */}
      {loading ? (
        <div className='flex-1 px-4 sm:px-6 lg:px-8'>
          <div className='h-full rounded-xl bg-gray-200 animate-pulse' />
        </div>
      ) : (
        <div className='flex-1 flex gap-2 px-2 sm:px-4 lg:px-0 pb-4 overflow-hidden'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className='flex-[8] rounded-md border border-gray-100 bg-white/80 p-4 shadow-sm'
          >
            <DataTable
              columns={columns}
              data={data}
              searchable={true}
              searchPlaceholder='Search files, users, or printers...'
              pageSizeOptions={[5, 10, 20, 50]}
              initialPageSize={10}
            />
          </motion.div>
        </div>
      )}
    </>
  )
}
