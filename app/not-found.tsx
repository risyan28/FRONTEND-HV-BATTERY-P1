'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Route } from './+types/root'

// Declare the custom window property
declare global {
  interface Window {
    appNavigation?: {
      goBack: () => void
    }
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: '404 - Page Not Found' }]
}

export function NotFoundPage() {
  const router = useNavigate()
  const [countdown, setCountdown] = useState(15)
  const [isHovering, setIsHovering] = useState(false)
  const [mousePosition, setMousePosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (countdown <= 0) {
      router('/dashboard-user/manufacture')
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, router])

  // Use the custom back function if available
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.appNavigation?.goBack) {
      window.appNavigation.goBack()
    } else {
      // Fallback to regular navigation
      router(-1)
    }
  }

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f9f9f9] via-[#e0f2ff] to-[#c2d3ff]'>
      {/* New Minimalist Background */}
      <div className='absolute inset-0 z-0 overflow-hidden'>
        {/* Grid Pattern */}
        <div
          className='absolute inset-0 opacity-10'
          style={{
            backgroundImage: `
              linear-gradient(to right, #64748b 1px, transparent 1px),
              linear-gradient(to bottom, #64748b 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Dynamic Lines */}
        <motion.div
          className='absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500'
          initial={{ x: -100 }}
          animate={{
            x: [
              0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650,
              700, 750, 800,
            ],
            transition: {
              duration: 30,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            },
          }}
        />

        {/* Improved Gradient Circle */}
        <motion.div
          className='pointer-events-none absolute rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10'
          style={{
            width: '800px',
            height: '800px',
          }}
          animate={{
            x: mousePosition.x - 200, // center the circle on cursor
            y: mousePosition.y - 200, // center the circle on cursor
            transition: {
              type: 'spring',
              damping: 20,
              stiffness: 100,
              mass: 0.1,
            },
          }}
        />
      </div>

      {/* Content (same as before) */}
      <div className='z-10 flex w-full max-w-3xl flex-col items-center px-4'>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8 text-center'
        >
          <motion.h1
            className='mb-2 text-[10rem] font-extrabold tracking-tighter text-white'
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            <span className='inline-block bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent'>
              404
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className='relative z-10 mb-4 whitespace-nowrap bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl md:text-5xl'
          >
            <h2 className='mb-4 text-3xl font-bold'>Page Not Found</h2>
            <p className='mb-8 text-lg'>Oops! This page is coming soon. 🚀</p>
          </motion.div>
        </motion.div>

        {/* Buttons (same as before) */}
        <motion.div
          className='flex flex-col gap-4 sm:flex-row'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button
            variant='outline'
            className='group border-purple-500 bg-purple-500/20 hover:bg-purple-500/20 cursor-pointer'
            onClick={handleBack}
          >
            <ArrowLeft className='mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1' />
            Go Back
          </Button>

          <Button
            className='relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white transition-all hover:from-purple-700 hover:to-blue-700 cursor-pointer'
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => router('/dashboard-user/manufacture')}
          >
            <Home className='mr-2 h-4 w-4' />
            Return Home
            <span className='absolute bottom-0 left-0 h-1 w-full bg-white/20'></span>
          </Button>

          <Button
            variant='outline'
            className='border-blue-500 bg-purple-500/20 hover:bg-blue-500/20 cursor-pointer'
            onClick={() =>
              typeof window !== 'undefined' && window.location.reload()
            }
          >
            <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
            Refresh Page
          </Button>
        </motion.div>

        {/* Countdown (same as before) */}
        <motion.div
          className='mt-8 text-center text-gray-400'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p>
            Redirecting to home in{' '}
            <span className='font-mono font-bold text-purple-400'>
              {countdown}
            </span>{' '}
            seconds
          </p>
          <div className='mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-800'>
            <motion.div
              className='h-full bg-gradient-to-r from-purple-500 to-blue-500'
              initial={{ width: '100%' }}
              animate={{ width: `${(countdown / 15) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Footer (same as before) */}
      <motion.div
        className='absolute bottom-4 text-center text-sm text-gray-500'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <p>
          © {new Date().getFullYear()} Manufacturing Dashboard. All rights
          reserved.
        </p>
      </motion.div>
    </div>
  )
}
