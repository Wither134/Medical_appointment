import type { Workout, Goal, AppStats } from '@/types'

// Returns ISO date string for today
export function today(): string {
  return new Date().toISOString().split('T')[0]
}

// Returns the ISO date of Monday this week
export function startOfWeek(): string {
  const d = new Date()
  const day = d.getDay() // 0=Sun, 1=Mon ...
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr)
  const monday = new Date(startOfWeek())
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return date >= monday && date <= sunday
}

export function computeStats(workouts: Workout[], goals: Goal[]): AppStats {
  const thisWeek = workouts.filter(w => isThisWeek(w.date))
  return {
    totalWorkouts: workouts.length,
    completedWorkouts: workouts.filter(w => w.completed).length,
    totalDurationMinutes: workouts.reduce((s, w) => s + w.durationMinutes, 0),
    totalCaloriesBurned: workouts.reduce((s, w) => s + w.caloriesBurned, 0),
    workoutsThisWeek: thisWeek.length,
    durationThisWeek: thisWeek.reduce((s, w) => s + w.durationMinutes, 0),
    caloriesThisWeek: thisWeek.reduce((s, w) => s + w.caloriesBurned, 0),
    completedGoals: goals.filter(g => g.completed).length,
  }
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function goalUnit(type: Goal['type']): string {
  switch (type) {
    case 'workouts':   return 'workouts'
    case 'minutes':    return 'min'
    case 'calories':   return 'kcal'
    case 'kilometers': return 'km'
  }
}

export function goalProgress(goal: Goal): number {
  if (goal.targetValue === 0) return 0
  return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// ─── Workout type color ───────────────────────────────────────────────────────

export function workoutTypeColor(type: Workout['type']): string {
  const map: Record<Workout['type'], string> = {
    Strength: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    Cardio:   'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    Running:  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
    Cycling:  'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',
    Yoga:     'bg-pink-100   text-pink-800   dark:bg-pink-900/30   dark:text-pink-300',
    Other:    'bg-gray-100   text-gray-800   dark:bg-gray-700      dark:text-gray-300',
  }
  return map[type] ?? map.Other
}

export function workoutTypeIcon(type: Workout['type']): string {
  const map: Record<Workout['type'], string> = {
    Strength: '🏋️',
    Cardio:   '🫀',
    Running:  '🏃',
    Cycling:  '🚴',
    Yoga:     '🧘',
    Other:    '⚡',
  }
  return map[type] ?? '⚡'
}
