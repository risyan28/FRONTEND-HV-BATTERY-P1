'use client'
import { Link, useLocation } from 'react-router-dom'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { SidebarProps } from './types'
import { useMenuItems } from '@/hooks/useMenuItems'
import type { MenuItem } from '@/hooks/useMenuItems'
import { useState } from 'react'

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = useMenuItems()
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

function renderMenu(items: MenuItem[], level = 0) {
  return items.map((item) => {
    const isActive = location.pathname === item.href
    const hasChildren = item.children && item.children.length > 0
    const isOpen = openMenus[item.label]

    return (
      <div key={item.label} className='space-y-1'>
        {hasChildren ? (
          <button
            onClick={() => toggleMenu(item.label)}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
              isOpen
                ? 'bg-blue-100 font-semibold text-blue-700'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <span className='text-xl'>
              {typeof item.icon === 'string' ? (
                <img src={item.icon} alt={item.label} className='h-5 w-5' />
              ) : (
                <item.icon className='h-5 w-5' />
              )}
            </span>
            <span className='text-sm'>{item.label}</span>
            <span className='ml-auto text-xs'>
              {isOpen ? (
                <ChevronDown className='h-4 w-4 transition-transform' />
              ) : (
                <ChevronRight className='h-4 w-4 transition-transform' />
              )}
            </span>
          </button>
        ) : (
          <Link
            to={item.href ?? '#'}
            className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
              isActive
                ? 'bg-blue-100 font-semibold text-blue-700'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <span className='text-xl'>
              {typeof item.icon === 'string' ? (
                <img src={item.icon} alt={item.label} className='h-5 w-5' />
              ) : (
                <item.icon className='h-5 w-5' />
              )}
            </span>
            <span className='text-sm'>{item.label}</span>
          </Link>
        )}

        {hasChildren && isOpen && (
          <div className='ml-1'>
            {renderMenu(item.children ?? [], level + 1)}
          </div>
        )}
      </div>
    )
  })
}



  // Component content remains the same
  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 h-screen w-72 transform border-r bg-white shadow-lg transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Component content remains the same */}
      <div className='flex items-center justify-between border-b p-4'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-teal-500 font-bold text-white'>
            D
          </div>
          <h1 className='whitespace-nowrap text-base font-bold text-gray-800 sm:text-lg md:text-xl'>
            DPIS App
          </h1>
        </div>
        <Button variant='ghost' size='icon' onClick={onClose}>
          <X className='h-5 w-5' />
        </Button>
      </div>
      <div className='max-h-screen flex-1 overflow-auto py-4'>
        {/* Rest of the sidebar content remains unchanged */}
        <div className='mb-2 px-3'>
          <p className='mb-2 px-3 text-xs font-medium text-gray-500'>
            MAIN MENU
          </p>
        </div>
        <nav className='space-y-1 px-3'>{renderMenu(menuItems)}</nav>
      </div>
    </div>
  )
}
