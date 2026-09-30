'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWorkouts } from '@/context/AppContext'
import { WorkoutCard } from '@/components/workouts/WorkoutCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'Strength', label: 'Strength' },
  { value: 'Cardio', label: 'Cardio' },
  { value: 'Running', label: 'Running' },
  { value: 'Cycling', label: 'Cycling' },
  { value: 'Yoga', label: 'Yoga' },
  { value: 'Other', label: 'Other' },
]

export default function WorkoutsPage() {
  const { workouts } = useWorkouts()
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)

  const filtered = workouts.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
                          w.type.toLowerCase().includes(search.toLowerCase())
    const matchesType   = !typeFilter || w.type === typeFilter
    const matchesStatus = showCompleted || !w.completed
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Workouts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{workouts.length} workouts total</p>
        </div>
        <Link href="/workouts/new">
          <Button>+ Add Workout</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search workouts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="sm:max-w-[160px]"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={e => setShowCompleted(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Show completed
        </label>
      </div>

      {/* Workout list */}
      {filtered.length === 0 ? (
        workouts.length === 0 ? (
          <EmptyState
            icon="🏋️"
            title="No workouts yet"
            description="Add your first workout to start tracking your progress."
            action={<Link href="/workouts/new"><Button>Add Workout</Button></Link>}
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No workouts match your search"
            description="Try adjusting your search or filters."
            action={<Button variant="outline" onClick={() => { setSearch(''); setTypeFilter('') }}>Clear Filters</Button>}
          />
        )
      ) : (
        <div className="space-y-3">
          {filtered.map(w => <WorkoutCard key={w.id} workout={w} />)}
        </div>
      )}
    </div>
  )
}
