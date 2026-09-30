'use client'

import Link from 'next/link'
import { useAppContext } from '@/context/AppContext'
import { computeStats, formatMinutes, formatDate, workoutTypeColor, workoutTypeIcon, goalProgress } from '@/lib/stats'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  const { state } = useAppContext()
  const { workouts, goals, user } = state
  const stats = computeStats(workouts, goals)

  const today = new Date().toISOString().split('T')[0]
  const todayWorkouts = workouts.filter(w => w.date === today)
  const recentWorkouts = workouts.slice(0, 5)
  const activeGoals = goals.filter(g => !g.completed).slice(0, 3)

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Weekly bar chart data (last 7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateKey = d.toISOString().split('T')[0]
    const count = workouts.filter(w => w.date === dateKey).length
    return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), count, isToday: dateKey === today }
  })
  const maxCount = Math.max(...weekDays.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good {getGreeting()}, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{dayName}, {dateStr}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/workouts/new">
            <Button size="sm">+ Add Workout</Button>
          </Link>
          <Link href="/goals">
            <Button size="sm" variant="outline">🎯 Goals</Button>
          </Link>
          <Link href="/assistant">
            <Button size="sm" variant="outline">🤖 Ask AI</Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Workouts"
          value={stats.totalWorkouts}
          icon="🏋️"
          subtext={`${stats.completedWorkouts} completed`}
          accent="text-blue-600"
        />
        <StatCard
          label="This Week"
          value={stats.workoutsThisWeek}
          icon="📅"
          subtext={`${formatMinutes(stats.durationThisWeek)} total`}
          accent="text-green-600"
        />
        <StatCard
          label="Calories Burned"
          value={stats.caloriesThisWeek.toLocaleString()}
          icon="🔥"
          subtext="This week"
          accent="text-orange-500"
        />
        <StatCard
          label="Active Goals"
          value={goals.filter(g => !g.completed).length}
          icon="🎯"
          subtext={`${stats.completedGoals} completed`}
          accent="text-purple-600"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: weekly activity + today */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly activity chart */}
          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
            <div className="flex items-end justify-between gap-2 h-24">
              {weekDays.map(day => (
                <div key={day.label} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${day.isToday ? 'bg-blue-600' : 'bg-blue-200 dark:bg-blue-900'}`}
                      style={{ height: `${(day.count / maxCount) * 72}px`, minHeight: day.count > 0 ? '8px' : '2px' }}
                    />
                  </div>
                  <span className={`text-xs ${day.isToday ? 'font-semibold text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">Workouts per day (last 7 days)</p>
          </Card>

          {/* Today's workouts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Today&apos;s Workouts</h3>
              <Link href="/workouts/new">
                <Button size="sm" variant="ghost">+ Add</Button>
              </Link>
            </div>
            {todayWorkouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">😴</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">No workouts logged today yet.</p>
                <Link href="/workouts/new" className="mt-3 inline-block">
                  <Button size="sm" className="mt-3">Log a Workout</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {todayWorkouts.map(w => (
                  <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="text-2xl">{workoutTypeIcon(w.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{w.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{w.durationMinutes} min · {w.caloriesBurned} kcal</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${w.completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {w.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent workouts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Workouts</h3>
              <Link href="/history">
                <Button size="sm" variant="ghost">View all →</Button>
              </Link>
            </div>
            {recentWorkouts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No workouts yet.</p>
            ) : (
              <div className="space-y-2">
                {recentWorkouts.map(w => (
                  <div key={w.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-xl">{workoutTypeIcon(w.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{w.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(w.date)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge label={w.type} className={workoutTypeColor(w.type)} />
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{w.durationMinutes} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: goals + quick actions */}
        <div className="space-y-6">
          {/* Active goals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Active Goals</h3>
              <Link href="/goals">
                <Button size="sm" variant="ghost">Manage →</Button>
              </Link>
            </div>
            {activeGoals.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No active goals.</p>
                <Link href="/goals">
                  <Button size="sm" variant="outline">Create Goal</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeGoals.map(g => {
                  const pct = goalProgress(g)
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">{g.title}</p>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} height="h-2" />
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {g.currentValue} / {g.targetValue}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/workouts/new', icon: '🏋️', label: 'Add Workout' },
                { href: '/goals',        icon: '🎯', label: 'Set Goal' },
                { href: '/progress',     icon: '📈', label: 'Progress' },
                { href: '/assistant',    icon: '🤖', label: 'Ask AI' },
              ].map(a => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-center"
                >
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{a.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          {/* This week summary */}
          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Workouts</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.workoutsThisWeek}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Duration</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatMinutes(stats.durationThisWeek)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Calories</span>
                <span className="font-semibold text-orange-500">{stats.caloriesThisWeek.toLocaleString()} kcal</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
