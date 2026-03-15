import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMenuItems } from '@/hooks/useMenuItems'

export function QuickAccess() {
  const menuItems = useMenuItems()

  return (
    <div className='mb-4 px-4'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>Menu</h2>
      </div>

      {/* Responsive Grid: 2 cols mobile, 3 cols tablet, 6 cols desktop */}
      <div className='grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-3 lg:grid-cols-4'>
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            className='w-full'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={item.href}
              className='group flex h-full min-h-[clamp(7.5rem,18vh,12.5rem)] flex-col items-center justify-center rounded-lg bg-white p-3 shadow-sm hover:bg-purple-100 active:bg-purple-200'
            >
              {/* Icon Container - Responsive Size */}
              <div className='mb-2 flex aspect-square w-[clamp(7.5rem,12vh,14rem)] items-center justify-center rounded-full bg-purple-100 ring-10 ring-purple-100/90'>
                {typeof item.icon === 'string' ? (
                  <img
                    src={item.icon}
                    alt={item.label}
                    className='h-[100%] w-[100%] object-contain'
                  />
                ) : (
                  <item.icon className='h-12 w-12 md:h-14 md:w-14' />
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
