# FitTrack — Complete Development Plan

## Status: Pending Implementation

---

## 1. Project Overview

**FitTrack** is a beginner-friendly, modern fitness tracking web application built with Next.js, TypeScript, and Tailwind CSS. It enables users to log workouts, set fitness goals, visualize progress, browse workout history, and interact with an AI fitness assistant — all backed by local/mock data storage so no backend infrastructure is required to get started.

---

## 2. Objectives

| # | Objective |
|---|---|
| 1 | Build a clean, responsive fitness dashboard |
| 2 | Allow full CRUD for workouts and goals |
| 3 | Visualize progress with charts and stats |
| 4 | Provide an AI assistant powered by workout/goal context |
| 5 | Demonstrate all major IBM Bob modes (Ask, Plan, Agent) |
| 6 | Keep architecture beginner-friendly and well-documented |

---

## 3. Recommended Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | File-based routing, server components, future API routes |
| Language | **TypeScript** | Type safety, better developer experience |
| Styling | **Tailwind CSS** | Utility-first, fast responsive design |
| Charts | **Recharts** | React-native, simple API, beginner-friendly |
| AI Assistant | **Vercel AI SDK + OpenAI** (or mock fallback) | Streaming chat, easy to swap with mock |
| State Management | **React Context + useReducer** | Lightweight, no extra dependencies |
| Data Persistence | **localStorage** (mock) | No backend needed initially |
| Icons | **Lucide React** | Consistent, Tailwind-compatible icon set |
| Forms | **React Hook Form + Zod** | Validation, TypeScript-safe schema |
| Testing | **Jest + React Testing Library + Playwright** | Unit + E2E coverage |

---

## 4. Application Architecture

**Data Flow:**
- All workout and goal data lives in React Context, initialized from and persisted to `localStorage`.
- The AI assistant reads the current context state and injects it as system context into the chat API route.
- Pages are Next.js App Router pages; shared UI is componentized under `/components`.

```
Browser → Next.js App Router → React Context Store (workouts · goals · ui)
                                        ↓
                                  localStorage (mock data layer)
                             ↓
                     API Route /api/ai/chat → OpenAI / Mock AI
```

---

## 5. Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Stats, today's workout, weekly progress, recent workouts |
| `/workouts` | Workout Tracker | List, add, edit, delete workouts |
| `/workouts/new` | Add Workout | Form to create a new workout |
| `/workouts/[id]/edit` | Edit Workout | Pre-filled form to edit existing workout |
| `/goals` | Fitness Goals | List, create, update, complete goals |
| `/progress` | Progress Page | Charts, metrics, completed goals, history summary |
| `/history` | Workout History | Full history with search and filters |
| `/assistant` | AI Assistant | Chat interface with fitness context |

---

## 6. Feature Breakdown

### 6.1 Dashboard
- Stats cards: workouts completed, total duration, calories burned, active goal
- "Today's Workout" panel — shows any workout logged for today
- Weekly progress bar — workouts this week vs. goal
- Recent workouts list — last 5 entries

### 6.2 Workout Tracker
- Add workout form with fields: name, type, date, duration, sets, reps, calories, completed toggle
- Workout type selector: Strength, Cardio, Running, Cycling, Yoga, Other
- Workout list with edit / delete actions
- Mark workout as complete inline

### 6.3 Fitness Goals
- Create goal form: title, target type (workouts/km/minutes), target value, deadline
- Goal card with progress bar showing current vs. target
- Mark goal as completed
- Delete goal

### 6.4 Progress Page
- Weekly summary cards: workout count, duration, calories
- Recharts line/bar chart: workouts per week over time
- Completed goals list
- Workout history table (last 10)

### 6.5 Workout History
- Full paginated list of all workouts
- Search by exercise name
- Filter by workout type (dropdown)
- Filter by date range (date pickers)
- Empty state when no results match

### 6.6 AI Fitness Assistant
- Chat-style interface (user message + assistant reply bubbles)
- System prompt injected with current workout and goal data
- Handles questions about stats, history, goals, and workout suggestions
- Mock fallback mode (no API key required for beginners)
- Loading state (typing indicator) and error state

---

## 7. Component Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with sidebar + topnav
│   ├── page.tsx                  # Dashboard
│   ├── workouts/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── goals/page.tsx
│   ├── progress/page.tsx
│   ├── history/page.tsx
│   ├── assistant/page.tsx
│   └── api/
│       └── ai/chat/route.ts      # AI chat API route
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── ThemeToggle.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── TodayWorkout.tsx
│   │   ├── WeeklyProgress.tsx
│   │   └── RecentWorkouts.tsx
│   ├── workouts/
│   │   ├── WorkoutForm.tsx
│   │   ├── WorkoutCard.tsx
│   │   └── WorkoutList.tsx
│   ├── goals/
│   │   ├── GoalForm.tsx
│   │   ├── GoalCard.tsx
│   │   └── GoalList.tsx
│   ├── progress/
│   │   ├── ProgressChart.tsx
│   │   └── ProgressSummary.tsx
│   ├── history/
│   │   ├── HistoryTable.tsx
│   │   ├── SearchBar.tsx
│   │   └── FilterPanel.tsx
│   ├── assistant/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── ProgressBar.tsx
│       ├── Modal.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorMessage.tsx
│
├── context/
│   ├── WorkoutContext.tsx
│   ├── GoalContext.tsx
│   └── ThemeContext.tsx
│
├── hooks/
│   ├── useWorkouts.ts
│   ├── useGoals.ts
│   ├── useLocalStorage.ts
│   └── useStats.ts
│
├── lib/
│   ├── mock-data.ts              # Seed data for local development
│   ├── stats.ts                  # Calculation utilities
│   ├── ai-context.ts             # Formats workout/goal data for AI prompt
│   └── validators.ts             # Zod schemas
│
└── types/
    └── index.ts                  # All TypeScript interfaces/types
```

---

## 8. Data Models

### Workout
```typescript
{
  id: string
  name: string
  type: "Strength" | "Cardio" | "Running" | "Cycling" | "Yoga" | "Other"
  date: string           // ISO date string
  durationMinutes: number
  sets?: number
  reps?: number
  caloriesBurned?: number
  completed: boolean
  notes?: string
  createdAt: string
}
```

### Goal
```typescript
{
  id: string
  title: string
  targetType: "workouts" | "kilometers" | "minutes"
  targetValue: number
  currentValue: number
  deadline?: string      // ISO date string
  completed: boolean
  createdAt: string
}
```

### ChatMessage
```typescript
{
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}
```

### AppStats (derived/computed — not stored)
```typescript
{
  totalWorkouts: number
  totalDurationMinutes: number
  totalCaloriesBurned: number
  workoutsThisWeek: number
  completedGoals: number
}
```

---

## 9. API Requirements

Since the initial version uses local/mock data, only **one real API route** is needed:

### POST /api/ai/chat

| Field | Detail |
|---|---|
| Input | `{ messages: ChatMessage[], context: AppStats & { recentWorkouts, activeGoals } }` |
| Output | Streaming text response (Vercel AI SDK) |
| Fallback | Rule-based mock responses when no API key is configured |
| Auth | None (client-side key via env var `OPENAI_API_KEY`) |

All other data operations (CRUD for workouts and goals) are handled entirely client-side via React Context + localStorage.

---

## 10. AI Assistant Architecture

**System prompt structure:**
1. Role definition ("You are a fitness assistant for FitTrack…")
2. Injected user data (total workouts, this week's workouts, active goals, last 5 workouts)
3. Instruction to answer only fitness-related questions using the provided data
4. User's message history

**Mock fallback rules:**
- Keywords like "workouts this week" → reads from context and returns count
- Keywords like "calories" → sums from context
- Keywords like "suggest" → returns a pre-written beginner workout suggestion
- Default → generic motivational response

```
User types question
        ↓
ChatInput component reads AppContext (workouts · goals · stats)
        ↓
lib/ai-context.ts builds system prompt
        ↓
POST /api/ai/chat
        ↓
OpenAI gpt-4o-mini  ──OR──  Mock AI fallback (rule-based)
        ↓
ChatWindow (streaming display)
```

---

## 11. Bob Skills That Could Be Created

| Skill Name | Purpose |
|---|---|
| `fittrack-component` | Guide for creating a new FitTrack UI component following project conventions |
| `fittrack-data-model` | Guide for adding a new data type (model + context + hook + localStorage) |
| `fittrack-test` | Standard pattern for writing tests for FitTrack pages and components |
| `fittrack-ai-prompt` | Guide for updating the AI system prompt to include new data fields |

---

## 12. Bob Hooks That Could Be Used

| Hook Event | Command / Action | Purpose |
|---|---|---|
| `postToolUse` (file write) | Run `tsc --noEmit` | Catch TypeScript errors after every file change |
| `postToolUse` (file write) | Run `eslint --fix` | Auto-lint on every save |
| `onSessionStart` | Print project README summary | Remind Bob of FitTrack conventions at session start |
| `onStop` | Run `jest --passWithNoTests` | Auto-run tests when Bob finishes a task |

---

## 13. Development Phases

```
Phase 1 — Foundation      → Project scaffold, layout, theme, mock data, types
Phase 2 — Core Features   → Dashboard, Workout CRUD, Goals CRUD
Phase 3 — Progress + History → Progress charts, workout history with search/filter
Phase 4 — AI Assistant    → Chat UI, API route, context builder, mock fallback
Phase 5 — Polish + Testing → Responsive design, dark mode, empty/error/loading states, tests
```

---

## 14. Task Breakdown by Phase

### Phase 1 — Foundation
- [ ] Scaffold Next.js 14 project with TypeScript and Tailwind CSS
- [ ] Install dependencies: Recharts, Lucide React, React Hook Form, Zod, Vercel AI SDK
- [ ] Define all TypeScript types in `types/index.ts`
- [ ] Create mock seed data in `lib/mock-data.ts`
- [ ] Build `WorkoutContext` and `GoalContext` with `localStorage` persistence
- [ ] Build root layout: `Sidebar`, `TopNav`, `ThemeToggle`
- [ ] Implement light/dark mode via `ThemeContext` and Tailwind `dark:` classes
- [ ] Build shared UI primitives: `Button`, `Card`, `Badge`, `ProgressBar`, `EmptyState`, `LoadingSpinner`, `ErrorMessage`

### Phase 2 — Core Features
- [ ] Build Dashboard page with `StatsCard`, `TodayWorkout`, `WeeklyProgress`, `RecentWorkouts`
- [ ] Build `useStats` hook for derived stat calculations
- [ ] Build Workout List page with `WorkoutCard` and `WorkoutList`
- [ ] Build Add Workout form (`/workouts/new`) with React Hook Form + Zod validation
- [ ] Build Edit Workout form (`/workouts/[id]/edit`) pre-populated from context
- [ ] Implement delete workout with confirmation
- [ ] Implement "mark as complete" toggle on workout cards
- [ ] Build Goals page with `GoalCard`, `GoalList`
- [ ] Build Add Goal form with validation
- [ ] Implement goal progress auto-calculation from workout data
- [ ] Implement mark goal as completed and delete goal

### Phase 3 — Progress & History
- [ ] Build Progress page with weekly summary cards
- [ ] Integrate Recharts — workouts-per-week bar chart, duration line chart
- [ ] Build completed goals display section
- [ ] Build History page with `HistoryTable`
- [ ] Implement search by exercise name
- [ ] Implement filter by workout type dropdown
- [ ] Implement filter by date range
- [ ] Add empty states for all filter/search combinations

### Phase 4 — AI Assistant
- [ ] Build `ChatWindow`, `ChatMessage`, `ChatInput` components
- [ ] Build `lib/ai-context.ts` to serialize workout/goal data into a system prompt
- [ ] Create `POST /api/ai/chat` route using Vercel AI SDK
- [ ] Implement OpenAI integration with `gpt-4o-mini`
- [ ] Implement mock/fallback AI using rule-based keyword matching
- [ ] Add streaming message display with typing indicator
- [ ] Add error handling for failed AI requests
- [ ] Wire AI assistant to live app context data

### Phase 5 — Polish & Testing
- [ ] Audit responsive layout on mobile, tablet, desktop
- [ ] Verify dark mode on all pages and components
- [ ] Add empty states to all pages (no workouts, no goals, no history)
- [ ] Add loading states for async operations
- [ ] Write unit tests for utility functions (`lib/stats.ts`, `lib/ai-context.ts`, validators)
- [ ] Write component tests for forms (workout form, goal form)
- [ ] Write component tests for dashboard stats cards
- [ ] Write E2E tests with Playwright: add workout, edit workout, delete workout, create goal, AI chat
- [ ] Final accessibility review (keyboard navigation, ARIA labels, contrast)

---

## 15. Dependencies

**Key dependency order:**
1. Types → Context → Hooks → Pages
2. UI primitives → all feature components
3. `lib/ai-context.ts` depends on WorkoutContext and GoalContext being stable
4. AI route depends on `lib/ai-context.ts` being finalized

```
types/index.ts
    └── WorkoutContext / GoalContext
            └── useWorkouts / useGoals / useStats
                    └── Dashboard / Workout Pages / Goal Pages / Progress / History
                    └── lib/ai-context.ts
                            └── /api/ai/chat
                                    └── Assistant Page
ui/ components → All Pages
Sidebar + TopNav → app/layout.tsx → All Pages
```

---

## 16. Testing Strategy

| Test Type | Tool | What is Tested |
|---|---|---|
| Unit | Jest | `lib/stats.ts`, `lib/ai-context.ts`, Zod validators, `useStats` hook |
| Component | React Testing Library | WorkoutForm, GoalForm, StatsCard, ChatWindow, EmptyState |
| Integration | React Testing Library | Dashboard renders correct stats from mock data; Goal progress updates when workout added |
| E2E | Playwright | Full user flows: add/edit/delete workout, create/complete goal, search history, AI chat |
| Visual | Manual | Dark mode, responsive layout on 3 breakpoints |

**Test file locations:**
- Unit: `src/lib/__tests__/`
- Component: `src/components/__tests__/`
- E2E: `e2e/`

---

## 17. Error-Handling Strategy

| Scenario | Handling Approach |
|---|---|
| Empty workouts list | `<EmptyState>` component with CTA to add first workout |
| Empty goals list | `<EmptyState>` with CTA to create first goal |
| No search/filter results | Inline empty state inside `HistoryTable` |
| Invalid form input | Zod + React Hook Form inline field error messages |
| AI API failure | Catch error → show `<ErrorMessage>` in chat with retry button |
| No OpenAI API key | Automatically fall back to mock AI responses |
| `localStorage` unavailable | Graceful fallback to in-memory state with console warning |
| Unknown workout ID in route | Redirect to `/workouts` with `notFound()` |

---

## 18. Future Improvements

| Improvement | Description |
|---|---|
| Backend / Database | Replace localStorage with a real DB (e.g. Supabase, PlanetScale) |
| Authentication | Add user accounts with NextAuth.js |
| Wearable Integration | Connect to Apple Health, Fitbit, or Google Fit APIs |
| Notifications | Browser push notifications for workout reminders |
| Social Features | Share goals or workouts with friends |
| Advanced Charts | Heatmap calendar (like GitHub contributions), body weight trend |
| Workout Templates | Save and reuse common workout structures |
| PWA | Make the app installable on mobile as a Progressive Web App |
| Export | Export workout history as CSV or PDF |
| Multi-language | i18n support for non-English users |

---

## Step-by-Step Implementation Roadmap

```
Step 1  ── Scaffold Next.js project + install all dependencies
Step 2  ── Define TypeScript types + create mock seed data
Step 3  ── Build React Context (Workouts + Goals + Theme) with localStorage
Step 4  ── Build root layout: Sidebar, TopNav, ThemeToggle, dark mode
Step 5  ── Build shared UI component library (Button, Card, Badge, etc.)
Step 6  ── Build Dashboard page + useStats hook
Step 7  ── Build Workout List, Add, Edit, Delete pages + forms
Step 8  ── Build Goals List, Add, Complete, Delete pages + forms
Step 9  ── Build Progress page + integrate Recharts
Step 10 ── Build Workout History page + search + filters
Step 11 ── Build AI assistant UI (ChatWindow, ChatMessage, ChatInput)
Step 12 ── Build /api/ai/chat route + ai-context.ts + mock fallback
Step 13 ── Responsive design audit + dark mode verification
Step 14 ── Add empty states, loading states, error states everywhere
Step 15 ── Write unit tests + component tests
Step 16 ── Write Playwright E2E tests
Step 17 ── Final accessibility + polish pass
```
