'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, useTheme } from '@/context/AppContext'

const PAGE_TITLES: Record<string, string> = {
  '/':          'Dashboard',
  '/workouts':  'Workouts',
  '/workouts/new': 'Add Workout',
  '/history':   'Workout History',
  '/goals':     'Fitness Goals',
  '/progress':  'Progress',
  '/assistant': 'AI Assistant',
  '/profile':   'Profile & Settings',
}

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const { darkMode, toggleDark } = useTheme()

  const title = PAGE_TITLES[pathname] ?? 'FitTrack'

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Open menu"
        >
          <span className="text-xl">☰</span>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
      </div>

      {/* Right: quick actions + avatar */}
      <div className="flex items-center gap-2">
        {/* Dark toggle (desktop duplicate for quick access) */}
        <button
          onClick={toggleDark}
          className="hidden md:flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
          aria-label="Toggle dark mode"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
        </button>

        {/* Add workout shortcut */}
        <Link
          href="/workouts/new"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <span>+</span> Workout
        </Link>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold ml-1">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
