import { motion } from 'framer-motion'

export function SafetyCompliance() {
  return (
    <motion.div
      className='w-full'
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <div className='container mx-auto mb-20 md:mb-6 px-4'>
        <div className='flex h-24 md:h-36 items-center justify-center rounded-xl bg-yellow-400 p-3 md:p-6 shadow-md'>
          <div className='flex w-full flex-row items-center justify-center gap-2 md:gap-6 text-center'>
            {/* Icon ⚠️ */}
            <div className='text-3xl md:text-7xl lg:text-8xl flex-shrink-0'>
              ⚠️
            </div>

            {/* Text */}
            <div className='flex-1'>
              <h2 className='text-sm md:text-4xl font-semibold text-black leading-tight'>
                Safety & Compliance
              </h2>
              <p className='text-xs md:text-2xl text-black/80'>
                Patuhi Prosedur Keselamatan Kerja
              </p>
            </div>

            {/* Helmet Image */}
            <div className='w-12 md:w-40 flex-shrink-0'>
              <img
                src='/images/safety-helmet.png'
                width={512}
                height={512}
                alt='Safety Helmet'
                className='h-auto w-full object-contain'
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
