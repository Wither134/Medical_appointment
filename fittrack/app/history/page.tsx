'use client'

import { useState } from 'react'
import { useWorkouts } from '@/context/AppContext'
import { formatDate, workoutTypeColor, workoutTypeIcon } from '@/lib/stats'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'Strength', label: 'Strength' },
  { value: 'Cardio', label: 'Cardio' },
  { value: 'Running', label: 'Running' },
  { value: 'Cycling', label: 'Cycling' },
  { value: 'Yoga', label: 'Yoga' },
  { value: 'Other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
]

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc',  label: 'Oldest First' },
  { value: 'duration',  label: 'Longest First' },
  { value: 'calories',  label: 'Most Calories' },
]

export default function HistoryPage() {
  const { workouts } = useWorkouts()

  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatus]   = useState('')
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')
  const [sort,       setSort]       = useState('date-desc')
  const [selected,   setSelected]   = useState<string | null>(null)

  const selectedWorkout = workouts.find(w => w.id === selected)

  const filtered = workouts
    .filter(w => {
      if (search && !w.name.toLowerCase().includes(search.toLowerCase()) &&
                   !w.type.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter && w.type !== typeFilter) return false
      if (statusFilter === 'completed' && !w.completed) return false
      if (statusFilter === 'pending'   &&  w.completed) return false
      if (dateFrom && w.date < dateFrom) return false
      if (dateTo   && w.date > dateTo)   return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'date-asc')  return a.date.localeCompare(b.date)
      if (sort === 'duration')  return b.durationMinutes - a.durationMinutes
      if (sort === 'calories')  return b.caloriesBurned - a.caloriesBurned
      return b.date.localeCompare(a.date) // date-desc default
    })

  function clearFilters() {
    setSearch('')
    setTypeFilter('')
    setStatus('')
    setDateFrom('')
    setDateTo('')
    setSort('date-desc')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workout History</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{workouts.length} workouts total · {filtered.length} shown</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by name or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="sm:w-40"
          />
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            className="sm:w-40"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            label=""
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            placeholder="From date"
            className="sm:w-44"
          />
          <Input
            label=""
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            placeholder="To date"
            className="sm:w-44"
          />
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="sm:w-44"
          />
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        workouts.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No workout history yet"
            description="Your workout history will appear here after you log workouts."
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No workouts match your filters"
            description="Try adjusting your search criteria or date range."
            action={<Button variant="outline" onClick={clearFilters}>Clear Filters</Button>}
          />
        )
      ) : (
        <>
          {/* Table header (desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <div className="col-span-4">Exercise</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Duration</div>
            <div className="col-span-1">Calories</div>
            <div className="col-span-2">Status</div>
          </div>

          <div className="space-y-2">
            {filtered.map(w => (
              <div
                key={w.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition"
                onClick={() => setSelected(w.id)}
              >
                {/* Mobile layout */}
                <div className="flex items-center gap-3 md:hidden">
                  <span className="text-xl">{workoutTypeIcon(w.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{w.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(w.date)} · {w.durationMinutes} min · {w.caloriesBurned} kcal</p>
                  </div>
                  <Badge label={w.type} className={workoutTypeColor(w.type)} />
                </div>
                {/* Desktop layout */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="text-lg">{workoutTypeIcon(w.type)}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{w.name}</span>
                  </div>
                  <div className="col-span-2">
                    <Badge label={w.type} className={workoutTypeColor(w.type)} />
                  </div>
                  <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">{formatDate(w.date)}</div>
                  <div className="col-span-1 text-sm text-gray-700 dark:text-gray-300">{w.durationMinutes}m</div>
                  <div className="col-span-1 text-sm text-orange-500">{w.caloriesBurned}</div>
                  <div className="col-span-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${w.completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {w.completed ? '✓ Completed' : '○ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail modal */}
      {selectedWorkout && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Workout Details">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{workoutTypeIcon(selectedWorkout.type)}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedWorkout.name}</h3>
                <Badge label={selectedWorkout.type} className={workoutTypeColor(selectedWorkout.type)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs">Date</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedWorkout.date)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs">Duration</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedWorkout.durationMinutes} min</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs">Calories</p>
                <p className="font-semibold text-orange-500">{selectedWorkout.caloriesBurned} kcal</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs">Status</p>
                <p className={`font-semibold ${selectedWorkout.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedWorkout.completed ? 'Completed' : 'Pending'}
                </p>
              </div>
              {selectedWorkout.sets && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Sets</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedWorkout.sets}</p>
                </div>
              )}
              {selectedWorkout.reps && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Reps</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedWorkout.reps}</p>
                </div>
              )}
            </div>
            {selectedWorkout.notes && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Notes</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWorkout.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
