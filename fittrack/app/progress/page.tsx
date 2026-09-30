'use client'

import type { Workout } from '@/types'
import { useAppContext } from '@/context/AppContext'
import { computeStats, formatMinutes, workoutTypeIcon, goalProgress, goalUnit } from '@/lib/stats'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'

export default function ProgressPage() {
  const { state } = useAppContext()
  const { workouts, goals } = state
  const stats = computeStats(workouts, goals)

  // ── Last 8 weeks bar chart data ──────────────────────────────────────────
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const monday = new Date()
    const day = monday.getDay()
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1) - i * 7)
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 6)
    const wStart = monday.toISOString().split('T')[0]
    const wEnd   = friday.toISOString().split('T')[0]
    const count  = workouts.filter(w => w.date >= wStart && w.date <= wEnd).length
    const label  = i === 0 ? 'This week' : `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    return { label, count }
  }).reverse()

  const maxWeekCount = Math.max(...weeks.map(w => w.count), 1)

  // ── Workout type distribution ─────────────────────────────────────────────
  const typeCounts: Record<string, number> = {}
  for (const w of workouts) {
    typeCounts[w.type] = (typeCounts[w.type] ?? 0) + 1
  }
  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])

  // ── Monthly stats ─────────────────────────────────────────────────────────
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthWorkouts = workouts.filter(w => w.date >= monthStart)
  const monthDuration = monthWorkouts.reduce((s, w) => s + w.durationMinutes, 0)
  const monthCalories = monthWorkouts.reduce((s, w) => s + w.caloriesBurned, 0)

  const activeGoals    = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g =>  g.completed)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Progress</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your fitness analytics at a glance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Workouts"    value={stats.totalWorkouts}          icon="🏋️" subtext="All time"          accent="text-blue-600"   />
        <StatCard label="This Week"         value={stats.workoutsThisWeek}       icon="📅" subtext={formatMinutes(stats.durationThisWeek)}  accent="text-green-600"  />
        <StatCard label="This Month"        value={monthWorkouts.length}          icon="📆" subtext={formatMinutes(monthDuration)} accent="text-purple-600" />
        <StatCard label="Calories (Week)"   value={`${stats.caloriesThisWeek.toLocaleString()} kcal`} icon="🔥" subtext="This week" accent="text-orange-500"  />
      </div>

      {/* Weekly workout chart */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Weekly Workout Volume (last 8 weeks)</h3>
        <div className="flex items-end gap-2 h-32 overflow-x-auto pb-2">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[60px]">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{week.count}</span>
              <div className="w-full flex items-end justify-center" style={{ height: '96px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${i === 7 ? 'bg-blue-600' : 'bg-blue-200 dark:bg-blue-900'}`}
                  style={{ height: `${Math.max((week.count / maxWeekCount) * 96, week.count > 0 ? 8 : 2)}px` }}
                />
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 text-center leading-tight">{week.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Two-column section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workout distribution */}
        <Card>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Workout Distribution</h3>
          {typeEntries.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No workout data yet.</p>
          ) : (
            <div className="space-y-3">
              {typeEntries.map(([type, count]) => {
                const pct = Math.round((count / workouts.length) * 100)
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="flex items-center gap-2">
                        <span>{workoutTypeIcon(type as Workout['type'])}</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{type}</span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <ProgressBar value={pct} height="h-2" />
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Goal summary */}
        <Card>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Goal Summary</h3>
          {goals.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No goals created yet.</p>
          ) : (
            <div className="space-y-4">
              {activeGoals.map(g => (
                <div key={g.id}>
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight pr-2">{g.title}</p>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">{goalProgress(g)}%</span>
                  </div>
                  <ProgressBar value={goalProgress(g)} height="h-2" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {g.currentValue} / {g.targetValue} {goalUnit(g.type)}
                  </p>
                </div>
              ))}
              {completedGoals.length > 0 && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                    ✅ {completedGoals.length} goal{completedGoals.length !== 1 ? 's' : ''} completed
                  </p>
                  {completedGoals.slice(0, 2).map(g => (
                    <p key={g.id} className="text-xs text-gray-500 dark:text-gray-400 truncate">• {g.title}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Monthly summary */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Workouts', value: monthWorkouts.length,                        icon: '🏋️', color: 'text-blue-600' },
            { label: 'Duration', value: formatMinutes(monthDuration),                 icon: '⏱️', color: 'text-green-600' },
            { label: 'Calories', value: `${monthCalories.toLocaleString()} kcal`,     icon: '🔥', color: 'text-orange-500' },
            { label: 'Completed', value: monthWorkouts.filter(w => w.completed).length, icon: '✅', color: 'text-purple-600' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">{item.icon}</p>
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* All-time stats */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">All-Time Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Workouts</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.totalWorkouts}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Duration</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{formatMinutes(stats.totalDurationMinutes)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Calories</p>
            <p className="text-xl font-bold text-orange-500 mt-0.5">{stats.totalCaloriesBurned.toLocaleString()} kcal</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Completed Workouts</p>
            <p className="text-xl font-bold text-green-600 mt-0.5">{stats.completedWorkouts}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Completed Goals</p>
            <p className="text-xl font-bold text-purple-600 mt-0.5">{stats.completedGoals}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Avg. Duration</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {workouts.length > 0 ? `${Math.round(stats.totalDurationMinutes / workouts.length)}m` : '—'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
