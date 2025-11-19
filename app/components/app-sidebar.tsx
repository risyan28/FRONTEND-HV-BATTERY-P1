'use client'

import React from 'react'

import {
  AudioWaveform,
  BookOpen,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  Users,
  BarChart3,
  Home,
  ShoppingCart,
  ChevronRight,
  MoreHorizontal,
  ChevronsUpDown,
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// This is sample data.
const data = {
  user: {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/placeholder.svg?height=32&width=32',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Analytics',
      url: '#',
      icon: BarChart3,
      items: [
        {
          title: 'Overview',
          url: '#',
        },
        {
          title: 'Reports',
          url: '#',
        },
        {
          title: 'Insights',
          url: '#',
        },
      ],
    },
    {
      title: 'E-commerce',
      url: '#',
      icon: ShoppingCart,
      items: [
        {
          title: 'Products',
          url: '#',
        },
        {
          title: 'Orders',
          url: '#',
        },
        {
          title: 'Customers',
          url: '#',
        },
        {
          title: 'Inventory',
          url: '#',
        },
      ],
    },
    {
      title: 'Users',
      url: '#',
      icon: Users,
      items: [
        {
          title: 'All Users',
          url: '#',
        },
        {
          title: 'Roles',
          url: '#',
        },
        {
          title: 'Permissions',
          url: '#',
        },
      ],
    },
    {
      title: 'Content',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Posts',
          url: '#',
        },
        {
          title: 'Pages',
          url: '#',
        },
        {
          title: 'Media',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
}

interface AppSidebarProps {
  collapsed?: boolean
  onPageChange?: (page: string) => void
}

export function AppSidebar({
  collapsed = false,
  onPageChange,
}: AppSidebarProps) {
  const [activeTeam, setActiveTeam] = React.useState(data.teams[0])
  const [expandedItems, setExpandedItems] = React.useState<string[]>([
    'Analytics',
  ])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  const handleItemClick = (title: string) => {
    onPageChange?.(title)
  }

  if (collapsed) {
    return (
      <TooltipProvider>
        <div className='flex h-full w-16 flex-col bg-white border-r border-slate-200 shadow-sm'>
          {/* Header - Collapsed */}
          <div className='p-3 border-b border-slate-200 flex justify-center'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md'>
                  {activeTeam.logo && <activeTeam.logo className='size-4' />}
                </div>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p>{activeTeam.name}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Navigation - Collapsed */}
          <div className='flex-1 overflow-auto p-2'>
            <div className='space-y-2'>
              {data.navMain.map((item) => (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={item.isActive ? 'secondary' : 'ghost'}
                      size='icon'
                      className='w-12 h-12 hover:bg-blue-50 transition-colors font-mono'
                      onClick={() => handleItemClick(item.title)}
                    >
                      {item.icon && <item.icon className='size-5' />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Footer - Collapsed */}
          <div className='p-3 border-t border-slate-200 flex justify-center'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className='h-8 w-8 rounded-lg cursor-pointer ring-2 ring-blue-100'>
                  <AvatarImage
                    src={data.user.avatar || '/placeholder.svg'}
                    alt={data.user.name}
                  />
                  <AvatarFallback className='rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white'>
                    JD
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p>{data.user.name}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <div className='flex h-full w-72 flex-col bg-white border-r border-slate-200 shadow-sm'>
      {/* Header */}
      <div className='p-4 border-b border-slate-200'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='w-full justify-start p-3 h-auto hover:bg-slate-50 transition-colors font-mono'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white mr-3 shadow-md'>
                {activeTeam.logo && <activeTeam.logo className='size-4' />}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold text-slate-900 font-mono'>
                  {activeTeam.name}
                </span>
                <span className='truncate text-xs text-slate-500 font-mono'>
                  {activeTeam.plan}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4 text-slate-400' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='start'>
            <DropdownMenuLabel className='text-xs text-slate-500 font-mono'>
              Teams
            </DropdownMenuLabel>
            {data.teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className='font-mono'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border mr-2'>
                  {team.logo && <team.logo className='size-4 shrink-0' />}
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <div className='flex-1 overflow-auto p-4'>
        <div className='space-y-2'>
          <div className='px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono'>
            Platform
          </div>
          {data.navMain.map((item) => (
            <div key={item.title}>
              {item.items ? (
                <Collapsible
                  open={expandedItems.includes(item.title)}
                  onOpenChange={() => toggleExpanded(item.title)}
                >
                  <div className='relative'>
                    {/* Vertical line indicator for expanded items with proper spacing */}
                    {expandedItems.includes(item.title) && (
                      <div className='absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full' />
                    )}
                    <CollapsibleTrigger asChild>
                      <Button
                        variant='ghost'
                        className={`w-full justify-start p-3 h-10 hover:bg-slate-50 transition-colors font-mono ${
                          expandedItems.includes(item.title)
                            ? 'bg-blue-50 text-blue-700 pl-8'
                            : ''
                        }`}
                      >
                        {item.icon && <item.icon className='mr-3 size-4' />}
                        <span className='flex-1 text-left font-medium'>
                          {item.title}
                        </span>
                        <ChevronRight
                          className={`size-4 transition-transform duration-200 text-slate-400 ${
                            expandedItems.includes(item.title)
                              ? 'rotate-90'
                              : ''
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className='space-y-1 relative ml-8 mt-1'>
                    {/* Vertical line for sub-items */}
                    <div className='absolute -left-4 top-0 bottom-0 w-0.5 bg-slate-200' />
                    {item.items.map((subItem) => (
                      <Button
                        key={subItem.title}
                        variant='ghost'
                        className='w-full justify-start pl-6 p-2 h-8 text-sm hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-mono'
                        onClick={() => handleItemClick(subItem.title)}
                      >
                        {subItem.title}
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Button
                  variant={item.isActive ? 'secondary' : 'ghost'}
                  className='w-full justify-start p-3 h-10 hover:bg-slate-50 transition-colors font-mono'
                  onClick={() => handleItemClick(item.title)}
                >
                  {item.icon && <item.icon className='mr-3 size-4' />}
                  <span className='font-medium'>{item.title}</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className='p-4 border-t border-slate-200'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='w-full justify-start p-3 h-auto hover:bg-slate-50 transition-colors font-mono'
            >
              <Avatar className='h-8 w-8 rounded-lg mr-3 ring-2 ring-blue-100'>
                <AvatarImage
                  src={data.user.avatar || '/placeholder.svg'}
                  alt={data.user.name}
                />
                <AvatarFallback className='rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white'>
                  JD
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold text-slate-900 font-mono'>
                  {data.user.name}
                </span>
                <span className='truncate text-xs text-slate-500 font-mono'>
                  {data.user.email}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4 text-slate-400' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' side='top'>
            <DropdownMenuLabel className='p-0 font-normal font-mono'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    src={data.user.avatar || '/placeholder.svg'}
                    alt={data.user.name}
                  />
                  <AvatarFallback className='rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white'>
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold font-mono'>
                    {data.user.name}
                  </span>
                  <span className='truncate text-xs text-muted-foreground font-mono'>
                    {data.user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='font-mono'>
              <BadgeCheck className='mr-2 size-4' />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem className='font-mono'>
              <CreditCard className='mr-2 size-4' />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem className='font-mono'>
              <Bell className='mr-2 size-4' />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='font-mono'>
              <LogOut className='mr-2 size-4' />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
