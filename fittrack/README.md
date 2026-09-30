# ⚡ FitTrack

A modern, beginner-friendly fitness tracking web application built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## Features

- 🏠 **Dashboard** — Stats overview, weekly activity chart, today's workouts, recent activity
- 🏋️ **Workouts** — Add, edit, delete, and complete workouts with full validation
- 📋 **History** — Browse all workouts with search, filter by type/date/status
- 🎯 **Goals** — Create and track fitness goals with progress bars
- 📈 **Progress** — Weekly charts, monthly summaries, workout distribution
- 🤖 **AI Assistant** — Context-aware fitness chat assistant (no API key required)
- 👤 **Profile** — Edit your profile, toggle dark mode, reset sample data
- 🌙 **Dark Mode** — Full dark/light mode support
- 📱 **Responsive** — Works on desktop, tablet, and mobile

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or later
- npm (comes with Node.js)

### Installation

```bash
# 1. Navigate into the project folder
cd fittrack

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

### Open the app

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | React Context + useReducer |
| Storage | localStorage (no backend needed) |
| AI | Mock AI engine (no API key required) |

## Project Structure

```
fittrack/
├── app/                    # Next.js pages (App Router)
│   ├── page.tsx            # Dashboard
│   ├── workouts/           # Workout management
│   ├── history/            # Workout history
│   ├── goals/              # Fitness goals
│   ├── progress/           # Progress analytics
│   ├── assistant/          # AI chat assistant
│   └── profile/            # Profile & settings
├── components/
│   ├── layout/             # Sidebar, TopNav, AppShell
│   ├── workouts/           # WorkoutCard, WorkoutForm
│   └── ui/                 # Shared UI: Button, Card, Modal, etc.
├── context/
│   └── AppContext.tsx      # Global state (workouts, goals, user, theme)
├── lib/
│   ├── mock-data.ts        # Sample seed data
│   ├── stats.ts            # Utility functions
│   └── ai-assistant.ts     # Mock AI response engine
└── types/
    └── index.ts            # TypeScript type definitions
```

## Data

All data is stored in your browser's **localStorage** — no database or backend required.

Sample data is loaded on first visit so the dashboard looks populated immediately.

You can reset to sample data at any time from the **Profile** page.

## Build for Production

```bash
npm run build
npm run start
```
