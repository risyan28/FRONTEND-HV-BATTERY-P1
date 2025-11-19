'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardContent } from '@/components/dashboard-content'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Search, Menu, Zap } from 'lucide-react'

export function DashboardMaster() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const [isLoading, setIsLoading] = useState(false)

  const handlePageChange = (page: string) => {
    if (page !== currentPage) {
      setIsLoading(true)
      setCurrentPage(page)
      // Simulate loading time
      setTimeout(() => {
        setIsLoading(false)
      }, 1200)
    }
  }

  return (
    <div className='flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-mono'>
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-72'} overflow-hidden flex-shrink-0`}
      >
        <AppSidebar
          collapsed={sidebarCollapsed}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden min-w-0'>
        {/* Fixed Header */}
        <header className='sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm'>
          <div className='flex w-full items-center gap-2 px-6'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className='-ml-1 hover:bg-blue-50 transition-colors'
            >
              <Menu className='h-4 w-4' />
            </Button>
            <Separator orientation='vertical' className='mr-2 h-4' />

            {/* App Title */}
            <div className='flex items-center gap-2 mr-4'>
              <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg'>
                <Zap className='w-4 h-4 text-white' />
              </div>
              <span className='font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                DataFlow Analytics
              </span>
            </div>

            <Separator orientation='vertical' className='mr-2 h-4' />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink
                    href='#'
                    className='text-slate-600 hover:text-blue-600'
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem>
                  <BreadcrumbPage className='text-slate-900 font-medium'>
                    {currentPage}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Header Actions */}
            <div className='ml-auto flex items-center space-x-4'>
              <div className='relative hidden md:block'>
                <Search className='absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
                <Input
                  placeholder='Search...'
                  className='pl-9 w-[250px] bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 transition-all font-mono'
                />
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='hover:bg-blue-50 transition-colors relative'
              >
                <Bell className='h-4 w-4' />
                <span className='absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center'>
                  9
                </span>
              </Button>
              <Button
                variant='outline'
                className='border-slate-200 hover:bg-slate-50 transition-colors bg-transparent font-mono'
              >
                Download
              </Button>
              <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md font-mono'>
                Create Report
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className='flex-1 overflow-auto'>
          <div
            className={`mx-auto px-6 py-6 ${sidebarCollapsed ? 'max-w-none' : 'max-w-[1600px]'}`}
          >
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <DashboardContent currentPage={currentPage} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
