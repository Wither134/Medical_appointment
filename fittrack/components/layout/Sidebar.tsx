'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/AppContext'

const NAV_ITEMS = [
  { href: '/',           label: 'Dashboard',   icon: '🏠' },
  { href: '/workouts',   label: 'Workouts',     icon: '🏋️' },
  { href: '/history',    label: 'History',      icon: '📋' },
  { href: '/goals',      label: 'Goals',        icon: '🎯' },
  { href: '/progress',   label: 'Progress',     icon: '📈' },
  { href: '/assistant',  label: 'AI Assistant', icon: '🤖' },
  { href: '/profile',    label: 'Profile',      icon: '👤' },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { darkMode, toggleDark } = useTheme()

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <span className="text-2xl">⚡</span>
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">FitTrack</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Dark mode toggle */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleDark}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <span className="text-base">{darkMode ? '☀️' : '🌙'}</span>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  )
}
