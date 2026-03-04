'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

type AppHeaderProps = {
  title?: string
}

export function AppHeader({ title }: AppHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) =>
    date
      .toLocaleTimeString('id-ID', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/\./g, ':')

  const formatDate = (date: Date) =>
    date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY
      setScrollPosition(position)
      setScrolled(position > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getGradient = () => {
    if (!scrolled) return 'from-blue-600 via-blue-500 to-teal-400'
    const gradients = [
      'from-blue-600 via-blue-500 to-teal-400',
      'from-purple-600 via-pink-500 to-orange-500',
      'from-indigo-600 via-blue-500 to-emerald-400',
      'from-rose-600 via-pink-500 to-yellow-400',
    ]
    return gradients[Math.floor((scrollPosition / 200) % gradients.length)]
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 w-full py-0.5 text-white transition-all duration-700 ${scrolled ? 'shadow-lg' : ''} bg-gradient-to-r ${getGradient()}`}
    >
      <div className='flex items-center justify-between px-2 h-8 md:h-10 w-full'>
        {/* Logo kiri */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className='flex-none'
        >
          <img
            src='/images/tmmin.png'
            alt='Toyota Logo'
            className='h-7 md:h-12 w-auto object-contain'
          />
        </motion.div>

        {/* Title tengah */}
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className='flex-1 text-center text-sm md:text-4xl font-bold px-1 md:px-0'
          >
            {title}
          </motion.h1>
        )}

        {/* Time & Date kanan */}
        <div className='flex flex-col items-end justify-center text-right flex-none'>
          <span className='text-xs md:text-xl font-mono font-bold'>
            {formatTime(currentTime)}
          </span>
          <span className='text-[10px] md:text-base opacity-90'>
            {formatDate(currentTime)}
          </span>
        </div>
      </div>
    </motion.header>
  )
}
