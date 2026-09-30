'use client'

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Workout, Goal, UserProfile, ChatMessage } from '@/types'
import { SAMPLE_WORKOUTS, SAMPLE_GOALS, SAMPLE_USER } from '@/lib/mock-data'
import { generateId } from '@/lib/stats'

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  workouts: Workout[]
  goals: Goal[]
  user: UserProfile
  chatHistory: ChatMessage[]
  darkMode: boolean
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_WORKOUT';    payload: Omit<Workout, 'id' | 'createdAt'> }
  | { type: 'UPDATE_WORKOUT'; payload: Workout }
  | { type: 'DELETE_WORKOUT'; payload: string }
  | { type: 'TOGGLE_WORKOUT'; payload: string }
  | { type: 'ADD_GOAL';       payload: Omit<Goal, 'id' | 'createdAt'> }
  | { type: 'UPDATE_GOAL';    payload: Goal }
  | { type: 'DELETE_GOAL';    payload: string }
  | { type: 'ADD_MESSAGE';    payload: Omit<ChatMessage, 'id' | 'timestamp'> }
  | { type: 'CLEAR_CHAT' }
  | { type: 'UPDATE_USER';    payload: Partial<UserProfile> }
  | { type: 'TOGGLE_DARK' }
  | { type: 'HYDRATE';        payload: AppState }

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload

    case 'ADD_WORKOUT':
      return {
        ...state,
        workouts: [
          { ...action.payload, id: generateId(), createdAt: new Date().toISOString() },
          ...state.workouts,
        ],
      }

    case 'UPDATE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.map(w =>
          w.id === action.payload.id ? action.payload : w
        ),
      }

    case 'DELETE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.filter(w => w.id !== action.payload),
      }

    case 'TOGGLE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.map(w =>
          w.id === action.payload ? { ...w, completed: !w.completed } : w
        ),
      }

    case 'ADD_GOAL':
      return {
        ...state,
        goals: [
          { ...action.payload, id: generateId(), createdAt: new Date().toISOString() },
          ...state.goals,
        ],
      }

    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.payload.id ? action.payload : g
        ),
      }

    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload),
      }

    case 'ADD_MESSAGE':
      return {
        ...state,
        chatHistory: [
          ...state.chatHistory,
          {
            ...action.payload,
            id: generateId(),
            timestamp: new Date().toISOString(),
          },
        ],
      }

    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] }

    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }

    case 'TOGGLE_DARK':
      return { ...state, darkMode: !state.darkMode }

    default:
      return state
  }
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: AppState = {
  workouts: SAMPLE_WORKOUTS,
  goals: SAMPLE_GOALS,
  user: SAMPLE_USER,
  chatHistory: [],
  darkMode: false,
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

const STORAGE_KEY = 'fittrack_v1'

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [hydrated, setHydrated] = React.useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AppState
        dispatch({ type: 'HYDRATE', payload: parsed })
      }
    } catch {
      // ignore parse errors – use initial state
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state, hydrated])

  // Apply dark mode class to <html>
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.darkMode])

  if (!hydrated) return null // avoid flash

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}

export function useWorkouts() {
  const { state, dispatch } = useAppContext()
  const addWorkout    = useCallback((w: Omit<Workout, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_WORKOUT',    payload: w }), [dispatch])
  const updateWorkout = useCallback((w: Workout) =>                           dispatch({ type: 'UPDATE_WORKOUT', payload: w }), [dispatch])
  const deleteWorkout = useCallback((id: string) =>                           dispatch({ type: 'DELETE_WORKOUT', payload: id }), [dispatch])
  const toggleWorkout = useCallback((id: string) =>                           dispatch({ type: 'TOGGLE_WORKOUT', payload: id }), [dispatch])
  return { workouts: state.workouts, addWorkout, updateWorkout, deleteWorkout, toggleWorkout }
}

export function useGoals() {
  const { state, dispatch } = useAppContext()
  const addGoal    = useCallback((g: Omit<Goal, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_GOAL',    payload: g }), [dispatch])
  const updateGoal = useCallback((g: Goal) =>                           dispatch({ type: 'UPDATE_GOAL', payload: g }), [dispatch])
  const deleteGoal = useCallback((id: string) =>                        dispatch({ type: 'DELETE_GOAL', payload: id }), [dispatch])
  return { goals: state.goals, addGoal, updateGoal, deleteGoal }
}

export function useChat() {
  const { state, dispatch } = useAppContext()
  const addMessage  = useCallback((m: Omit<ChatMessage, 'id' | 'timestamp'>) => dispatch({ type: 'ADD_MESSAGE', payload: m }), [dispatch])
  const clearChat   = useCallback(() => dispatch({ type: 'CLEAR_CHAT' }), [dispatch])
  return { chatHistory: state.chatHistory, addMessage, clearChat }
}

export function useUser() {
  const { state, dispatch } = useAppContext()
  const updateUser = useCallback((u: Partial<UserProfile>) => dispatch({ type: 'UPDATE_USER', payload: u }), [dispatch])
  return { user: state.user, updateUser }
}

export function useTheme() {
  const { state, dispatch } = useAppContext()
  const toggleDark = useCallback(() => dispatch({ type: 'TOGGLE_DARK' }), [dispatch])
  return { darkMode: state.darkMode, toggleDark }
}
