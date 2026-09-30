'use client'

import { useState, type FormEvent } from 'react'
import type { Goal, GoalType } from '@/types'
import { useGoals } from '@/context/AppContext'
import { goalProgress, goalUnit } from '@/lib/stats'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const GOAL_TYPE_OPTIONS: { value: GoalType; label: string }[] = [
  { value: 'workouts',   label: 'Number of Workouts' },
  { value: 'minutes',    label: 'Exercise Duration (minutes)' },
  { value: 'calories',   label: 'Calories Burned' },
  { value: 'kilometers', label: 'Distance (kilometers)' },
]

interface GoalFormData {
  title: string
  type: GoalType
  targetValue: string
  currentValue: string
  deadline: string
}

const emptyForm: GoalFormData = { title: '', type: 'workouts', targetValue: '', currentValue: '0', deadline: '' }

function GoalFormModal({
  open, onClose, initial
}: { open: boolean; onClose: () => void; initial?: Goal }) {
  const { addGoal, updateGoal } = useGoals()
  const [form, setForm] = useState<GoalFormData>(
    initial
      ? { title: initial.title, type: initial.type, targetValue: String(initial.targetValue), currentValue: String(initial.currentValue), deadline: initial.deadline ?? '' }
      : emptyForm
  )
  const [errors, setErrors] = useState<Partial<GoalFormData>>({})

  function set(k: keyof GoalFormData, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  function validate(): boolean {
    const e: Partial<GoalFormData> = {}
    if (!form.title.trim())                                      e.title       = 'Title is required.'
    const t = Number(form.targetValue)
    if (!form.targetValue || isNaN(t) || t <= 0)                e.targetValue = 'Target must be a positive number.'
    const c = Number(form.currentValue)
    if (form.currentValue === '' || isNaN(c) || c < 0)          e.currentValue = 'Current progress must be 0 or more.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    const payload = {
      title:        form.title.trim(),
      type:         form.type,
      targetValue:  Number(form.targetValue),
      currentValue: Number(form.currentValue),
      deadline:     form.deadline || undefined,
      completed:    initial?.completed ?? false,
    }
    if (initial) updateGoal({ ...initial, ...payload })
    else         addGoal(payload)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Goal' : 'Create Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Goal Title *"
          id="g-title"
          placeholder="e.g., Complete 5 workouts per week"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          error={errors.title}
        />
        <Select
          label="Goal Type *"
          id="g-type"
          options={GOAL_TYPE_OPTIONS}
          value={form.type}
          onChange={e => set('type', e.target.value as GoalType)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={`Target (${goalUnit(form.type)}) *`}
            id="g-target"
            type="number"
            min="1"
            placeholder="e.g., 5"
            value={form.targetValue}
            onChange={e => set('targetValue', e.target.value)}
            error={errors.targetValue}
          />
          <Input
            label={`Current Progress (${goalUnit(form.type)})`}
            id="g-current"
            type="number"
            min="0"
            placeholder="e.g., 0"
            value={form.currentValue}
            onChange={e => set('currentValue', e.target.value)}
            error={errors.currentValue}
          />
        </div>
        <Input
          label="Deadline (optional)"
          id="g-deadline"
          type="date"
          value={form.deadline}
          onChange={e => set('deadline', e.target.value)}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit">{initial ? 'Save Changes' : 'Create Goal'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

function GoalCard({ goal: g }: { goal: Goal }) {
  const { updateGoal, deleteGoal } = useGoals()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [progressInput, setProgressInput] = useState(String(g.currentValue))
  const [editingProgress, setEditingProgress] = useState(false)

  const pct = goalProgress(g)

  const progressColor =
    pct >= 100 ? 'bg-green-500' :
    pct >= 60  ? 'bg-blue-500' :
    pct >= 30  ? 'bg-yellow-500' : 'bg-red-400'

  function saveProgress() {
    const v = Number(progressInput)
    if (!isNaN(v) && v >= 0) {
      updateGoal({ ...g, currentValue: v, completed: v >= g.targetValue ? true : g.completed })
    }
    setEditingProgress(false)
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{g.title}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge
                label={GOAL_TYPE_OPTIONS.find(o => o.value === g.type)?.label ?? g.type}
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              />
              {g.completed && <Badge label="Completed ✓" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />}
              {g.deadline && (
                <Badge
                  label={`Due: ${new Date(g.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                />
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>✏️</Button>
            <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(true)} className="text-red-500">🗑️</Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-semibold text-gray-900 dark:text-white">{pct}%</span>
          </div>
          <ProgressBar value={pct} color={progressColor} height="h-3" />
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{g.currentValue} / {g.targetValue} {goalUnit(g.type)}</span>
            {!g.completed && (
              <button
                className="text-blue-500 hover:text-blue-600 underline"
                onClick={() => { setProgressInput(String(g.currentValue)); setEditingProgress(true) }}
              >
                Update
              </button>
            )}
          </div>
        </div>

        {/* Inline progress editor */}
        {editingProgress && (
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="number"
              min="0"
              value={progressInput}
              onChange={e => setProgressInput(e.target.value)}
              className="w-28"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">{goalUnit(g.type)}</span>
            <Button size="sm" onClick={saveProgress}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingProgress(false)}>✕</Button>
          </div>
        )}

        {/* Mark complete */}
        {!g.completed && pct >= 100 && (
          <div className="mt-3">
            <Button size="sm" variant="primary" onClick={() => updateGoal({ ...g, completed: true })}>
              🎉 Mark as Completed
            </Button>
          </div>
        )}
      </div>

      <GoalFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={g} />

      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Goal">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete <strong>{g.title}</strong>?
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => { deleteGoal(g.id); setDeleteConfirm(false) }}>Delete</Button>
          <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  )
}

export default function GoalsPage() {
  const { goals } = useGoals()
  const [createOpen, setCreateOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  const active    = goals.filter(g => !g.completed)
  const completed = goals.filter(g =>  g.completed)
  const displayed = showCompleted ? goals : active

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fitness Goals</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {active.length} active · {completed.length} completed
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={e => setShowCompleted(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show completed
          </label>
          <Button onClick={() => setCreateOpen(true)}>+ Create Goal</Button>
        </div>
      </div>

      {/* Goals */}
      {displayed.length === 0 ? (
        goals.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No goals yet"
            description="Create your first fitness goal to start tracking your progress."
            action={<Button onClick={() => setCreateOpen(true)}>Create Goal</Button>}
          />
        ) : (
          <EmptyState
            icon="✅"
            title="All goals completed!"
            description="Check 'Show completed' to see your finished goals, or create a new one."
            action={<Button onClick={() => setCreateOpen(true)}>Create New Goal</Button>}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map(g => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}

      <GoalFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
