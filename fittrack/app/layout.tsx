import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'FitTrack — Your Fitness Dashboard',
  description: 'A modern fitness tracking app to log workouts, set goals, and track progress.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  )
}
