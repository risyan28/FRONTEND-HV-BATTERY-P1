'use client'

import { useEffect, useState } from 'react'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Show skeleton for exactly 1 second
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Only show the skeleton during loading
  if (!isLoading) return null

  return <DashboardSkeleton />
}
