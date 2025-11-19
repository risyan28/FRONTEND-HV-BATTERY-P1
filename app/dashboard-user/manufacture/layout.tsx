'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/manufacture/dashboard/sidebar'
import { Header } from '@/components/manufacture/dashboard/header'
import { BottomNav } from '@/components/manufacture/dashboard/BottomNav'
import { motion } from 'framer-motion'
import { Footer } from '@/components/manufacture/dashboard/Footer'
import { AnimatePresence } from 'framer-motion'
import { LoadingScreen } from '@/components/loading-screen'
import { NavigationHandler } from '@/components/navigation-handler'
import { MainMenu } from './MainMenu'
import { SafetyCompliance } from '@/components/manufacture/dashboard/SafetyCompliance'


export function DashboardLayout(): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [key, setKey] = useState(Date.now())



  // Set loading to false after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Force re-render when navigation happens
  const handleNavigation = () => {
    // Force a re-render of the layout and all children
    setIsLoading(true)
    setKey(Date.now())

    // Reset loading state after a short delay
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className='flex min-h-screen flex-col bg-zinc-100'>
      {/* Navigation Handler */}
      <NavigationHandler onNavigate={handleNavigation} />

      {/* Loading Screen - Only shown during loading */}
      {isLoading && <LoadingScreen />}

      {/* Only show the actual layout when not loading */}
      {!isLoading && (
        <>
          {/* Overlay for when sidebar is open */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-20 bg-black/20'
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Component */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className='flex flex-1 flex-col'>
            {/* Header Component */}
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <AnimatePresence mode='wait'>
              <motion.main
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className='flex-1'
              >
                <MainMenu />
              </motion.main>
            </AnimatePresence>

            <SafetyCompliance />
            {/* Footer Component */}
            <Footer />
          </div>

          <BottomNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </>
      )}
    </div>
  )
}
