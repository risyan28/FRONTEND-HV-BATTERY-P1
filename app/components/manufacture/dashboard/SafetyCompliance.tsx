import { motion } from 'framer-motion'

export function SafetyCompliance() {
  return (
    <motion.div
      className='w-full'
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <div className='container mx-auto mb-10 px-4 md:mb-6'>
        <div className='flex h-36 items-center justify-center rounded-xl bg-yellow-400 p-4 shadow-md md:p-6'>
          <div className='flex w-full flex-row items-center justify-center space-y-4 text-center md:flex-row md:space-x-6 md:space-y-0'>
            {/* Icon ⚠️ */}
            <div className='text-lg sm:text-4xl md:text-7xl lg:text-8xl'>
              ⚠️
            </div>

            {/* Text */}
            <div className='px-2'>
              <h2 className='text-nowrap text-lg font-semibold text-black md:text-4xl'>
                Safety & Compliance
              </h2>
              <p className='text-nowrap text-sm text-black/80 md:text-2xl'>
                Patuhi Prosedur Keselamatan Kerja
              </p>
            </div>

            {/* Helmet Image */}
            <div className='w-8 sm:w-20 md:w-40 lg:w-40 xl:w-40'>
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
