import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMenuItems } from '@/hooks/useMenuItems'

export function QuickAccess() {
  const menuItems = useMenuItems()
  return (
    <div className='container mx-auto mb-6 px-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>Menu</h2>
      </div>
      <div className='grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-7'>
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            className='w-full'
            whileHover={{ scale: 1.09 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to={item.href}
              key={index}
              className='flex flex-col items-center rounded-lg bg-white p-3 shadow-sm hover:bg-purple-100'
            >
              <div className='mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100'>
                {typeof item.icon === 'string' ? (
                  <img src={item.icon} alt={item.label} className='h-5 w-5' />
                ) : (
                  <item.icon className='h-5 w-5' />
                )}
              </div>
              <span className='text-center text-xs'>{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
