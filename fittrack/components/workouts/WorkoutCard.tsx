'use client'

import { useState } from 'react'
import type { Workout } from '@/types'
import { useWorkouts } from '@/context/AppContext'
import { formatDate, workoutTypeColor, workoutTypeIcon } from '@/lib/stats'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { WorkoutForm } from './WorkoutForm'

interface WorkoutCardProps {
  workout: Workout
}

export function WorkoutCard({ workout: w }: WorkoutCardProps) {
  const { deleteWorkout, toggleWorkout } = useWorkouts()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
          {workoutTypeIcon(w.type)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{w.name}</h3>
            <Badge label={w.type} className={workoutTypeColor(w.type)} />
            {w.completed && (
              <Badge label="Completed" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>📅 {formatDate(w.date)}</span>
            <span>⏱️ {w.durationMinutes} min</span>
            <span>🔥 {w.caloriesBurned} kcal</span>
            {w.sets  && <span>💪 {w.sets} sets</span>}
            {w.reps  && <span>🔄 {w.reps} reps</span>}
          </div>
          {w.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{w.notes}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant={w.completed ? 'secondary' : 'outline'}
            onClick={() => toggleWorkout(w.id)}
            title={w.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {w.completed ? '✓ Done' : '○ Done'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)} title="Edit">✏️</Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(true)} title="Delete" className="text-red-500 hover:text-red-600">🗑️</Button>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Workout">
        <WorkoutForm initial={w} onSave={() => setEditOpen(false)} />
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Workout">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete <strong>{w.name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => { deleteWorkout(w.id); setDeleteConfirm(false) }}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  )
}
