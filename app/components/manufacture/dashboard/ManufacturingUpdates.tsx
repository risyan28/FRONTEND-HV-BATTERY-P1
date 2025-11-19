import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

const updates = [
  {
    title: 'Mesin A-01 Maintenance Hari Ini',
    description: 'Scheduled maintenance pada mesin A-01 jam 14:00 - 16:00.',
    img: '/images/maintenance.jpeg',
  },
  {
    title: 'Kualitas Produk Batch #1209',
    description: 'Ditemukan defect rate di atas 5% pada batch #1209.',
    img: '/images/quality-check.jpg',
  },
  {
    title: 'Penyesuaian Shift Minggu Ini',
    description: 'Shift malam dimulai pukul 20:00 mulai hari Rabu.',
    img: '/images/shift-schedule.png',
  },
  {
    title: 'Target Produksi April Diperbarui',
    description: 'Target baru: 15.000 unit/week untuk Line 3.',
    img: '/images/production-target.webp',
  },
]

export function ManufacturingUpdates() {
  return (
    <div className='container mx-auto mb-10 px-4 md:mb-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>Manufacturing Updates</h2>
        <Link to='#' className='text-sm text-blue-500'>
          View All
        </Link>
      </div>
      <div className='grid cursor-pointer grid-cols-2 gap-4 lg:grid-cols-4'>
        {updates.map((item, index) => (
          <motion.div
            key={index}
            className='w-full'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {' '}
            <Card key={index} className='overflow-hidden'>
              <CardContent className='p-0'>
                <img
                  src={item.img}
                  width={400}
                  height={200}
                  alt='News'
                  className='h-40 w-full object-cover'
                />
                <div className='p-3'>
                  <h3 className='text-sm font-medium'>{item.title}</h3>
                  <p className='text-xs text-gray-500'>{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
