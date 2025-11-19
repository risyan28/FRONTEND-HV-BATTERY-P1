'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HeaderProps } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

export function Header({ onMenuClick }: HeaderProps) {
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

  // Calculate dynamic gradient based on scroll position
  const getGradient = () => {
    if (!scrolled) return 'from-blue-600 via-blue-500 to-teal-400'

    // Cycle through different gradients based on scroll position
    const gradients = [
      'from-blue-600 via-blue-500 to-teal-400',
      'from-purple-600 via-pink-500 to-orange-500',
      'from-indigo-600 via-blue-500 to-emerald-400',
      'from-rose-600 via-pink-500 to-yellow-400',
    ]

    const index = Math.floor((scrollPosition / 200) % gradients.length)
    return gradients[index]
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 w-full py-3 text-white transition-all duration-700 ${
        scrolled ? 'shadow-lg' : ''
      } bg-gradient-to-r ${getGradient()}`}
    >
      <div className='container mx-auto flex items-center justify-between px-4 h-12'>
        {/* Left section: Menu + Logo */}
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            className='text-white hover:bg-white/20'
            onClick={onMenuClick}
          >
            <Menu className='h-10 w-10' />
          </Button>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className='flex items-center'
          >
            <img
              src='/images/tmmin.png'
              alt='Toyota Logo'
              width={120}
              height={40}
              className='h-14 w-auto object-contain'
            />
          </motion.div>
        </div>

        {/* Center section: e-WOS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className='relative'
        >
          <h1 className='flex-1 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis text-[clamp(1rem,3vw,3rem)] leading-none'>
            HEV BATTERY DASHBOARD PLANT 1
          </h1>
          <motion.span
            className=''
            animate={{ width: '100%' }}
            transition={{ delay: 0.8, duration: 0.6 }}
          />
        </motion.div>

        {/* Right section: Avatar + User Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className='flex items-center gap-3'
        >
          {/* Time & Date kanan */}
          <div className='flex flex-col items-end justify-center text-right flex-none'>
            <span className='text-2xl font-mono font-bold'>
              {formatTime(currentTime)}
            </span>
            <span className='text-xl opacity-90'>
              {formatDate(currentTime)}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.header>
  )
}
