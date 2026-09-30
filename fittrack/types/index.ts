// ─── Workout ─────────────────────────────────────────────────────────────────

export type WorkoutType =
  | 'Strength'
  | 'Cardio'
  | 'Running'
  | 'Cycling'
  | 'Yoga'
  | 'Other'

export interface Workout {
  id: string
  name: string
  type: WorkoutType
  date: string          // ISO date string YYYY-MM-DD
  durationMinutes: number
  sets?: number
  reps?: number
  caloriesBurned: number
  notes?: string
  completed: boolean
  createdAt: string
}

// ─── Goal ────────────────────────────────────────────────────────────────────

export type GoalType = 'workouts' | 'minutes' | 'calories' | 'kilometers'

export interface Goal {
  id: string
  title: string
  type: GoalType
  targetValue: number
  currentValue: number
  deadline?: string     // ISO date string YYYY-MM-DD
  completed: boolean
  createdAt: string
}

// ─── User / Profile ──────────────────────────────────────────────────────────

export type PreferredWorkout = WorkoutType | 'None'

export interface UserProfile {
  name: string
  email: string
  fitnessGoal: string
  preferredWorkout: PreferredWorkout
  joinedDate: string
}

// ─── Stats (derived) ─────────────────────────────────────────────────────────

export interface AppStats {
  totalWorkouts: number
  completedWorkouts: number
  totalDurationMinutes: number
  totalCaloriesBurned: number
  workoutsThisWeek: number
  durationThisWeek: number
  caloriesThisWeek: number
  completedGoals: number
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: string
}
