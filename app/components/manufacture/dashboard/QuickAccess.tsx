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

      {/* Responsive Grid: 2 cols mobile, 3 cols tablet, 6 cols desktop */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6'>
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            className='w-full'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={item.href}
              className='group flex h-full flex-col items-center justify-center rounded-lg bg-white p-4 shadow-sm hover:bg-purple-100 active:bg-purple-200 min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]'
            >
              {/* Icon Container - Responsive Size */}
              <div className='mb-3 flex aspect-square w-28 sm:w-32 md:w-36 lg:w-40 items-center justify-center rounded-full bg-purple-100'>
                {typeof item.icon === 'string' ? (
                  <img
                    src={item.icon}
                    alt={item.label}
                    className='h-[85%] w-[85%] object-contain'
                  />
                ) : (
                  <item.icon className='h-10 w-10 md:h-12 md:w-12' />
                )}
              </div>

              {/* Label - Larger responsive text */}
              <span className='text-center text-sm md:text-lg lg:text-xl font-bold leading-tight px-1'>
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
