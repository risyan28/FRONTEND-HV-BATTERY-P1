import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Grid } from 'lucide-react'
import { useMenuItems } from '@/hooks/useMenuItems'

export function QuickAccess() {
  const menuItems = useMenuItems()

  return (
      <div className='mb-2 px-4'>
      <div className='mb-1.5 flex items-center gap-1.5'>
        <Grid className='h-5 w-5 text-slate-600' />
        <h2 className='text-base md:text-lg font-bold text-slate-800'>Menu</h2>
      </div>

      {/* Responsive Grid */}
      <div className='grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-3 lg:grid-cols-4'>
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            className='w-full'
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={item.href}
              className='group flex h-full min-h-[clamp(6rem,14vh,9rem)] flex-col items-center justify-center rounded-xl bg-white p-3 shadow-sm hover:bg-purple-100 active:bg-purple-200'
            >
              {/* Icon Container */}
              <div className='mb-1.5 flex aspect-square w-[clamp(4.5rem,10vh,8rem)] items-center justify-center rounded-full bg-purple-100 ring-8 ring-purple-100/90'>
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

              {/* Label */}
              <span className='text-center text-base md:text-lg font-bold leading-tight px-1'>
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
