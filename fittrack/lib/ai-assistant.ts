import type { Workout, Goal } from '@/types'
import { computeStats, formatMinutes, goalProgress, goalUnit, isThisWeek } from '@/lib/stats'

/**
 * Mock AI response engine.
 * Reads real workout/goal data and returns context-aware answers.
 * Replace this function body with a real API call when ready.
 */
export function generateAIResponse(
  message: string,
  workouts: Workout[],
  goals: Goal[]
): string {
  const lower = message.toLowerCase()
  const stats = computeStats(workouts, goals)

  // ── This week workouts ────────────────────────────────────────────────────
  if (lower.includes('this week') && (lower.includes('workout') || lower.includes('exercise'))) {
    return `You completed **${stats.workoutsThisWeek} workout${stats.workoutsThisWeek !== 1 ? 's' : ''}** this week, totalling **${formatMinutes(stats.durationThisWeek)}** of exercise. Keep it up! 💪`
  }

  // ── Calories ──────────────────────────────────────────────────────────────
  if (lower.includes('calori')) {
    return `This week you've burned **${stats.caloriesThisWeek.toLocaleString()} calories**. Your all-time total is **${stats.totalCaloriesBurned.toLocaleString()} calories**. Great work! 🔥`
  }

  // ── Recent workouts ───────────────────────────────────────────────────────
  if (lower.includes('recent') || lower.includes('last workout') || lower.includes('did i do')) {
    const recent = workouts.slice(0, 3)
    if (recent.length === 0) return "You haven't logged any workouts yet. Start by adding your first workout!"
    const list = recent
      .map(w => `• **${w.name}** (${w.type}) — ${w.durationMinutes} min on ${new Date(w.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
      .join('\n')
    return `Here are your most recent workouts:\n\n${list}`
  }

  // ── Goals / progress ─────────────────────────────────────────────────────
  if (lower.includes('goal') || lower.includes('progress') || lower.includes('target')) {
    const active = goals.filter(g => !g.completed)
    if (active.length === 0) return "You have no active goals right now. Create a goal on the Goals page to start tracking!"
    const list = active
      .map(g => `• **${g.title}**: ${g.currentValue}/${g.targetValue} ${goalUnit(g.type)} (${goalProgress(g)}%)`)
      .join('\n')
    return `Here's your progress toward your active goals:\n\n${list}\n\nKeep going — you're doing great! 🎯`
  }

  // ── Duration / time ───────────────────────────────────────────────────────
  if (lower.includes('duration') || lower.includes('time') || lower.includes('minute') || lower.includes('hour')) {
    return `This week you've exercised for **${formatMinutes(stats.durationThisWeek)}**. Your total all-time exercise time is **${formatMinutes(stats.totalDurationMinutes)}**. 🕐`
  }

  // ── Total workouts ────────────────────────────────────────────────────────
  if (lower.includes('how many') && lower.includes('workout')) {
    return `You've logged **${stats.totalWorkouts} workouts** in total, with **${stats.completedWorkouts}** marked as completed. This week you've done **${stats.workoutsThisWeek}**. 📊`
  }

  // ── Suggest a workout ─────────────────────────────────────────────────────
  if (lower.includes('suggest') || lower.includes('focus') || lower.includes('today') || lower.includes('recommend') || lower.includes('should i')) {
    const thisWeekWorkouts = workouts.filter(w => isThisWeek(w.date))
    const types = thisWeekWorkouts.map(w => w.type)
    if (!types.includes('Cardio') && !types.includes('Running')) {
      return "You haven't done cardio yet this week! Try a **20–30 min run** or a **HIIT session** — great for your cardiovascular health and calorie burn. 🏃"
    }
    if (!types.includes('Strength')) {
      return "Consider a **strength training session** today — compound exercises like squats, deadlifts, and bench press are great for building muscle and boosting metabolism. 🏋️"
    }
    if (!types.includes('Yoga')) {
      return "You've been working hard! A **yoga or stretching session** today would help recovery, improve flexibility, and reduce muscle soreness. 🧘"
    }
    return "You've had a well-rounded week! Consider a light **active recovery day** — a walk, some stretching, or a short yoga flow to keep your body moving without overdoing it. 🌟"
  }

  // ── Stats overview ────────────────────────────────────────────────────────
  if (lower.includes('stats') || lower.includes('summary') || lower.includes('overview')) {
    return `Here's your fitness summary:\n\n• **Total workouts**: ${stats.totalWorkouts}\n• **This week**: ${stats.workoutsThisWeek} workouts, ${formatMinutes(stats.durationThisWeek)}, ${stats.caloriesThisWeek} kcal\n• **Completed goals**: ${stats.completedGoals}\n• **Total calories burned**: ${stats.totalCaloriesBurned.toLocaleString()} kcal\n\nYou're making great progress! 💪`
  }

  // ── Greeting ──────────────────────────────────────────────────────────────
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hi there! 👋 I'm your FitTrack AI assistant. I can help you with:\n\n• Workout statistics and history\n• Progress toward your goals\n• Workout suggestions\n• Fitness summaries\n\nWhat would you like to know?`
  }

  // ── Default ───────────────────────────────────────────────────────────────
  return `I can help you with your fitness data! Try asking me:\n\n• "How many workouts did I complete this week?"\n• "How many calories did I burn?"\n• "What workouts did I do recently?"\n• "How am I progressing toward my goals?"\n• "What should I focus on today?"`
}
