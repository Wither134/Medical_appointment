'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Workout, WorkoutType } from '@/types'
import { useWorkouts } from '@/context/AppContext'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const WORKOUT_TYPES: WorkoutType[] = ['Strength', 'Cardio', 'Running', 'Cycling', 'Yoga', 'Other']

interface WorkoutFormProps {
  initial?: Workout
  onSave?: () => void
}

interface FormErrors {
  name?: string
  type?: string
  date?: string
  duration?: string
  calories?: string
}

export function WorkoutForm({ initial, onSave }: WorkoutFormProps) {
  const router = useRouter()
  const { addWorkout, updateWorkout } = useWorkouts()
  const isEdit = !!initial

  const todayStr = new Date().toISOString().split('T')[0]

  const [name,        setName]        = useState(initial?.name ?? '')
  const [type,        setType]        = useState<WorkoutType>(initial?.type ?? 'Strength')
  const [date,        setDate]        = useState(initial?.date ?? todayStr)
  const [duration,    setDuration]    = useState(String(initial?.durationMinutes ?? ''))
  const [sets,        setSets]        = useState(String(initial?.sets ?? ''))
  const [reps,        setReps]        = useState(String(initial?.reps ?? ''))
  const [calories,    setCalories]    = useState(String(initial?.caloriesBurned ?? ''))
  const [notes,       setNotes]       = useState(initial?.notes ?? '')
  const [completed,   setCompleted]   = useState(initial?.completed ?? false)
  const [errors,      setErrors]      = useState<FormErrors>({})
  const [submitting,  setSubmitting]  = useState(false)

  function validate(): boolean {
    const errs: FormErrors = {}
    if (!name.trim())         errs.name     = 'Exercise name is required.'
    if (!type)                errs.type     = 'Please select a workout type.'
    if (!date)                errs.date     = 'Date is required.'
    const dur = Number(duration)
    if (!duration || isNaN(dur) || dur <= 0 || dur > 1440)
                              errs.duration = 'Duration must be a number between 1 and 1440 minutes.'
    const cal = Number(calories)
    if (calories !== '' && (isNaN(cal) || cal < 0 || cal > 10000))
                              errs.calories = 'Calories must be a number between 0 and 10000.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      name:             name.trim(),
      type,
      date,
      durationMinutes:  Number(duration),
      sets:             sets ? Number(sets) : undefined,
      reps:             reps ? Number(reps) : undefined,
      caloriesBurned:   calories ? Number(calories) : 0,
      notes:            notes.trim() || undefined,
      completed,
    }

    if (isEdit && initial) {
      updateWorkout({ ...initial, ...payload })
    } else {
      addWorkout(payload)
    }

    setSubmitting(false)
    if (onSave) {
      onSave()
    } else {
      router.push('/workouts')
    }
  }

  const inner = (
    <>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {isEdit ? 'Edit Workout' : 'Add New Workout'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Exercise Name *"
            id="name"
            placeholder="e.g., Morning Run"
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
          />
          <Select
            label="Workout Type *"
            id="type"
            value={type}
            onChange={e => setType(e.target.value as WorkoutType)}
            options={WORKOUT_TYPES.map(t => ({ value: t, label: t }))}
            error={errors.type}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date *"
            id="date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            error={errors.date}
          />
          <Input
            label="Duration (minutes) *"
            id="duration"
            type="number"
            min="1"
            max="1440"
            placeholder="e.g., 45"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            error={errors.duration}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Sets"
            id="sets"
            type="number"
            min="1"
            placeholder="e.g., 3"
            value={sets}
            onChange={e => setSets(e.target.value)}
          />
          <Input
            label="Reps"
            id="reps"
            type="number"
            min="1"
            placeholder="e.g., 12"
            value={reps}
            onChange={e => setReps(e.target.value)}
          />
          <Input
            label="Calories Burned"
            id="calories"
            type="number"
            min="0"
            placeholder="e.g., 350"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            error={errors.calories}
          />
        </div>

        <Textarea
          label="Notes"
          id="notes"
          placeholder="Any notes about this workout..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={completed}
            onChange={e => setCompleted(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as completed</span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Add Workout'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  )

  if (onSave) return <div>{inner}</div>
  return <Card className="max-w-2xl mx-auto">{inner}</Card>
}
