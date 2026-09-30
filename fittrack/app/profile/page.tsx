'use client'

import { useState, type FormEvent } from 'react'
import type { PreferredWorkout } from '@/types'
import { useUser, useTheme, useAppContext } from '@/context/AppContext'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/stats'
import { SAMPLE_WORKOUTS, SAMPLE_GOALS, SAMPLE_USER } from '@/lib/mock-data'

const WORKOUT_TYPE_OPTIONS = [
  { value: 'None',      label: 'No preference' },
  { value: 'Strength',  label: 'Strength' },
  { value: 'Cardio',    label: 'Cardio' },
  { value: 'Running',   label: 'Running' },
  { value: 'Cycling',   label: 'Cycling' },
  { value: 'Yoga',      label: 'Yoga' },
  { value: 'Other',     label: 'Other' },
]

export default function ProfilePage() {
  const { user, updateUser } = useUser()
  const { darkMode, toggleDark } = useTheme()
  const { dispatch } = useAppContext()

  const [name,      setName]      = useState(user.name)
  const [email,     setEmail]     = useState(user.email)
  const [fitnessGoal, setFitnessGoal] = useState(user.fitnessGoal)
  const [preferred, setPreferred] = useState(user.preferredWorkout)
  const [saved,     setSaved]     = useState(false)
  const [errors,    setErrors]    = useState<{ name?: string; email?: string }>({})

  function validate(): boolean {
    const e: { name?: string; email?: string } = {}
    if (!name.trim())  e.name  = 'Name is required.'
    if (!email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    updateUser({ name: name.trim(), email: email.trim(), fitnessGoal: fitnessGoal.trim(), preferredWorkout: preferred })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function resetToSampleData() {
    dispatch({ type: 'HYDRATE', payload: {
      workouts: SAMPLE_WORKOUTS,
      goals: SAMPLE_GOALS,
      user: SAMPLE_USER,
      chatHistory: [],
      darkMode,
    }})
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Member since {formatDate(user.joinedDate)}</p>
        </div>
      </div>

      {/* Profile form */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Profile Information</h3>
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
            />
            <Input
              label="Email *"
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
            />
          </div>
          <Input
            label="Fitness Goal"
            id="fitnessGoal"
            placeholder="e.g., Build strength and improve endurance"
            value={fitnessGoal}
            onChange={e => setFitnessGoal(e.target.value)}
          />
          <Select
            label="Preferred Workout Type"
            id="preferred"
            options={WORKOUT_TYPE_OPTIONS}
            value={preferred}
            onChange={e => setPreferred(e.target.value as PreferredWorkout)}
          />
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">Save Changes</Button>
            {saved && <span className="text-sm text-green-600 dark:text-green-400">✓ Saved!</span>}
          </div>
        </form>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {darkMode ? 'Dark Mode' : 'Light Mode'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {darkMode ? 'Switch to a lighter interface' : 'Switch to a darker interface'}
            </p>
          </div>
          <button
            onClick={toggleDark}
            className={`relative inline-flex w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            aria-label="Toggle dark mode"
          >
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </Card>

      {/* Data management */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          FitTrack stores all your data locally in your browser. No account or internet connection is required.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToSampleData}
          >
            Reset to Sample Data
          </Button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Resetting will replace all current data with the built-in sample workouts and goals.
        </p>
      </Card>

      {/* App info */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">About FitTrack</h3>
        <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
          <p>🏋️ <strong className="text-gray-700 dark:text-gray-300">FitTrack</strong> — Your personal fitness dashboard</p>
          <p>Version 1.0.0</p>
          <p>Built with Next.js, TypeScript & Tailwind CSS</p>
          <p>All data is stored locally in your browser.</p>
        </div>
      </Card>
    </div>
  )
}
