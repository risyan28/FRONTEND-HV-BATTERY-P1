import { motion } from 'framer-motion'

export function SafetyCompliance() {
  return (
    <motion.div
      className='w-full'
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className='container mx-auto px-4'>
        <div className='flex h-18 md:h-24 items-center justify-center rounded-xl bg-yellow-400 px-4 shadow-md'>
          <div className='flex w-full flex-row items-center justify-center gap-3 md:gap-5 text-center'>
            {/* Icon ⚠️ */}
            <div className='text-3xl md:text-5xl flex-shrink-0 leading-none'>
              ⚠️
            </div>

            {/* Text */}
            <div className='flex-1'>
              <h2 className='text-base md:text-2xl font-bold text-black leading-tight'>
                Safety & Compliance
              </h2>
              <p className='text-sm md:text-xl text-black/80 leading-tight'>
                Comply with All Safety Procedures
              </p>
            </div>

            {/* Helmet Image */}
            <div className='w-12 md:w-24 flex-shrink-0'>
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
