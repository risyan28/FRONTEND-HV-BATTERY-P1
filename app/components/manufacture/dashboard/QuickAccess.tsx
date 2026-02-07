import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMenuItems } from '@/hooks/useMenuItems'

export function QuickAccess() {
  const menuItems = useMenuItems()
  const itemCount = menuItems.length
  const colsPerRow = Math.min(itemCount, 6) // Maksimal 6 kolom per baris
  const rows = Math.ceil(itemCount / colsPerRow) // Hitung jumlah baris

  // Tentukan lebar icon berdasarkan jumlah baris
  let iconWidthClass = 'w-full' // default: 1 baris
  if (rows === 2) {
    iconWidthClass = 'w-5/12'
  } else if (rows >= 3) {
    iconWidthClass = 'w-3/12'
  }

  return (
    <div className='container mx-auto mb-6 px-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>Menu</h2>
      </div>

      <div
        className='grid gap-4'
        style={{
          gridTemplateColumns: `repeat(${colsPerRow}, minmax(0, 1fr))`,
        }}
      >
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            className='w-full'
            whileHover={{ scale: 1.09 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to={item.href}
              className='group flex h-full flex-col items-center justify-between rounded-lg bg-white p-3 shadow-sm hover:bg-purple-100'
            >
              {/* Icon Container - DINAMIS BERDASARKAN JUMLAH BARIS */}
              <div
                className={`mb-2 flex aspect-square ${iconWidthClass} items-center justify-center rounded-full bg-purple-100`}
              >
                {typeof item.icon === 'string' ? (
                  <img
                    src={item.icon}
                    alt={item.label}
                    className='h-[65%] w-[65%] object-contain'
                  />
                ) : (
                  <item.icon className='h-[30%] w-[30%]' />
                )}
              </div>

              {/* Label */}
              <span
                className='text-center text-[clamp(0.7rem,3vw,1.3rem)] font-bold mt-1'
                style={{
                  fontSize: `clamp(0.7rem, ${100 / colsPerRow}vw, 1.3rem)`,
                }}
              >
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
