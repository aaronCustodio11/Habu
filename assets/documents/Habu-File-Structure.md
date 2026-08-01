# Habu — File Structure Guide

**Purpose:** the same file structure from the dev plan, reorganized so it's easier to hold in your head — grouped by *what each layer does*, with a module lookup table and a walkthrough of how one action actually flows through the folders.

---

## 1. The Big Picture (5 layers)

Before the full tree, here's the mental model — every folder in Habu belongs to one of five layers, and each layer only talks to the one directly below it:

```
┌─────────────────────────────────────────────┐
│  app/            → SCREENS (what you see)     │  "the page"
├─────────────────────────────────────────────┤
│  components/     → REUSABLE UI PIECES          │  "the building blocks"
├─────────────────────────────────────────────┤
│  hooks/ + store/ → STATE (what's happening)    │  "the memory"
├─────────────────────────────────────────────┤
│  lib/            → LOGIC (how things work)     │  "the engine"
├─────────────────────────────────────────────┤
│  constants/ + types/ → SHARED DEFINITIONS      │  "the shared vocabulary"
└─────────────────────────────────────────────┘
```

**The rule of thumb:** a *screen* (`app/`) should mostly just arrange *components*, which pull their data from *hooks*, which read from *lib/*. If you ever find yourself writing SQLite queries or Supabase calls directly inside a screen file, that logic belongs one layer down, in `lib/`.

---

## 2. Annotated Tree

```
Habu/
│
├── app/  ⟵ SCREENS — one file per screen, named for what the user sees
│   │
│   ├── _layout.tsx                    # App-wide wrapper: loads fonts/theme, decides
│   │                                   # onboarding → login → home based on auth state
│   ├── onboarding.tsx                 # The swipeable intro screens
│   │
│   ├── (auth)/                        # Everything a LOGGED-OUT user can reach
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   │
│   ├── (app)/                         # Everything a LOGGED-IN user can reach
│   │   ├── _layout.tsx                # The bottom tab bar (Home / Boards / Settings)
│   │   ├── home/index.tsx             # The daily-use main screen
│   │   ├── boards/
│   │   │   ├── index.tsx              # Full board list (Active/Archived tabs)
│   │   │   ├── create.tsx             # "New board" form
│   │   │   └── [boardId]/             # Anything scoped to ONE specific board
│   │   │       ├── index.tsx          # That board's heatmap + stats
│   │   │       ├── edit.tsx           # Edit that board's details/reminder
│   │   │       └── customize.tsx      # Pick that board's widgets
│   │   └── settings/
│   │       ├── index.tsx              # Settings menu
│   │       ├── account.tsx            # Email/password
│   │       ├── delete-account.tsx     # The multi-step deletion flow
│   │       ├── notifications.tsx      # Global reminder preferences
│   │       └── theme.tsx              # Light/dark toggle
│   │
│   └── modal/                         # Popups — NOT full screens
│       ├── check-in.tsx               # "Mark done + add a note"
│       └── customize-home-stats.tsx   # Edit Home's quick-stats widgets
│
├── components/  ⟵ REUSABLE PIECES — no screen "owns" these, they get imported everywhere
│   │
│   ├── ui/                            # Generic, app-agnostic: Button, Input, Card, Modal
│   ├── board/                         # Board-specific: BoardCard, IconPicker, ColorPicker
│   │
│   ├── heatmap/
│   │   └── HeatmapGrid.tsx            # The raw SVG grid — one component, used everywhere
│   │                                  # a heatmap shows up (widget, board card, detail page)
│   │
│   ├── widgets/                       # The 5 things a user can put on a dashboard
│   │   ├── HeatmapWidget.tsx
│   │   ├── StreakCounter.tsx
│   │   ├── WeeklyBarChart.tsx
│   │   ├── MonthlyCompletionPct.tsx
│   │   └── BestStreakBadge.tsx
│   │
│   ├── stats/                         # The UI for CHOOSING/ARRANGING widgets (not the widgets themselves)
│   │   ├── QuickStatsRow.tsx          # Renders Home's widget row
│   │   ├── WidgetPicker.tsx           # "Add a widget" list
│   │   ├── WidgetSlot.tsx             # One widget + its reorder/remove buttons
│   │   └── WidgetRenderer.tsx         # Given a widget_type string, picks the right
│   │                                  # component from widgets/ above — the one file
│   │                                  # that connects "stats" to "widgets"
│   │
│   ├── EmptyState.tsx                 # "Nothing here yet" — reused on every empty screen
│   ├── OfflineBanner.tsx              # "Offline — changes will sync later"
│   └── SyncIndicator.tsx              # Small syncing spinner/shimmer
│
├── lib/  ⟵ LOGIC — no UI at all, just functions. This is the "engine room."
│   │
│   ├── supabase/                      # Talks to the CLOUD database
│   │   ├── client.ts                  # One shared connection
│   │   ├── auth.ts                    # Sign up / log in / log out / reset password
│   │   └── queries/                   # One file per table, cloud-side
│   │       ├── boards.ts
│   │       ├── completions.ts
│   │       └── widgetConfigs.ts
│   │
│   ├── db/                            # Talks to the LOCAL, on-device database
│   │   ├── schema.ts                  # Defines the local tables
│   │   ├── client.ts                  # One shared local connection
│   │   └── repositories/              # Same 3 files as queries/ above — deliberately
│   │       ├── boardsRepo.ts          # mirrored 1:1, so syncing between them is simple
│   │       ├── completionsRepo.ts
│   │       └── widgetConfigsRepo.ts
│   │
│   ├── sync/                          # The bridge between local and cloud
│   │   ├── syncEngine.ts              # The actual push/pull/merge logic
│   │   ├── netinfo.ts                 # "Are we online right now?"
│   │   └── useSyncStatus.ts           # Turns syncEngine's state into something
│   │                                  # OfflineBanner/SyncIndicator can display
│   │
│   ├── streaks/
│   │   └── calculateStreak.ts         # Pure math: given check-in dates, what's the streak?
│   │                                  # No database calls in here — just numbers in, numbers out
│   │
│   └── notifications/
│       ├── permissions.ts             # Asks for notification permission (only when
│       │                              # the user actually sets a reminder)
│       └── scheduler.ts               # Schedules/cancels each board's reminder
│
├── hooks/  ⟵ STATE (per-screen) — the glue between lib/ and components/
│   ├── useAuth.ts                     # "Who's logged in right now?"
│   ├── useBoards.ts                   # "Give me this user's boards, kept up to date"
│   ├── useTheme.ts                    # "What theme should I render?"
│   └── useColorScheme.ts              # (already comes scaffolded with Expo)
│
├── store/  ⟵ STATE (app-wide) — small, global, and persisted where it needs to be
│   ├── authStore.ts                   # Current session
│   ├── themeStore.ts                  # Light/Dark/System choice
│   └── onboardingStore.ts             # "Has this device seen onboarding already?"
│
├── constants/  ⟵ SHARED VALUES that don't change at runtime
│   ├── Colors.ts                      # Every light/dark design token, in one place
│   ├── Icons.ts                       # The board icon picker's options
│   └── WidgetTypes.ts                 # The 5 official widget definitions
│
├── types/  ⟵ SHARED SHAPES — what a "board," "completion," etc. actually look like
│   ├── database.types.ts              # Auto-generated from the Supabase schema
│   ├── board.ts
│   ├── completion.ts
│   └── widgetConfig.ts
│
├── assets/
│   ├── fonts/
│   ├── images/
│   └── icons/
│
└── config files (project root)
    ├── app.json / app.config.js       # App name, bundle IDs, icons
    ├── eas.json                       # Build profiles (dev / preview / production)
    ├── package.json
    ├── tsconfig.json
    └── .env                           # Supabase keys — gitignored, never committed
```

---

## 3. Module → File Lookup Table

The dev plan's 14 design modules, and exactly where each one lives in code. Use this table when you're about to build a module and want to know which file to open first.

| # | Module | Primary file(s) |
|---|---|---|
| 1 | Onboarding | `app/onboarding.tsx` |
| 2 | Simple Login | `app/(auth)/login.tsx` |
| 3 | Forgot Password | `app/(auth)/forgot-password.tsx`, `reset-password.tsx` |
| 4 | Home Screen | `app/(app)/home/index.tsx` |
| 5 | Create/Edit Board | `app/(app)/boards/create.tsx`, `[boardId]/edit.tsx` |
| 6 | Check-in / Add Note | `app/modal/check-in.tsx` |
| 7 | Selected Board Stats | `app/(app)/boards/[boardId]/index.tsx` |
| 8 | Customizable Dashboard | `app/(app)/boards/[boardId]/customize.tsx`, `app/modal/customize-home-stats.tsx`, plus all of `components/stats/` and `components/widgets/` |
| 9 | Boards Module (Active/Archived) | `app/(app)/boards/index.tsx` |
| 10 | Reminders & Notifications | `app/(app)/settings/notifications.tsx` + `lib/notifications/` |
| 11 | Empty States | `components/EmptyState.tsx` (shared, not one screen) |
| 12 | Loading & Offline Indicator | `components/OfflineBanner.tsx`, `SyncIndicator.tsx` + `lib/sync/` |
| 13 | Settings | `app/(app)/settings/*` |
| 14 | Theming | `constants/Colors.ts`, `store/themeStore.ts`, `app/(app)/settings/theme.tsx` |

---

## 4. Walkthrough: One Tap, Through Every Layer

To make the "5 layers" idea concrete, here's exactly what happens, file by file, when a user taps a board on Home to check it off:

```
1. app/(app)/home/index.tsx
   User taps a board row.

2. components/board/BoardCard.tsx
   The row itself — fires an onPress that calls a hook, doesn't touch data directly.

3. hooks/useBoards.ts
   Calls completionsRepo.upsertCompletion(boardId, today).

4. lib/db/repositories/completionsRepo.ts
   Writes to LOCAL SQLite immediately, sets pending_sync = true.
   → UI updates INSTANTLY here. The user sees the checkmark now.

5. lib/sync/syncEngine.ts  (runs separately, in the background)
   Next time it triggers (app foreground / reconnect), it notices the
   pending_sync row and pushes it to lib/supabase/queries/completions.ts,
   which writes it to the real Supabase table.

6. lib/streaks/calculateStreak.ts
   Whenever Selected Board Stats or a Streak Counter widget needs a number,
   it recalculates from the completions now sitting in local SQLite.
```

**Why this matters:** steps 1–4 are instant and never touch the network. Step 5 happens later, invisibly, whenever a connection exists. That's the whole point of the local-first architecture from the TDD — the folder structure exists to make that separation easy to maintain, not just to look organized.

---

## 5. Quick Reference: "Where Do I Put This?"

A few common "where does X go" questions, answered directly:

| If you're building... | It goes in... |
|---|---|
| A new screen | `app/` — named for what it shows, nested to match its route |
| A new widget type (6th widget) | `components/widgets/`, then register it in `constants/WidgetTypes.ts` and add one case to `WidgetRenderer.tsx` |
| A new reusable button/card style | `components/ui/` |
| A new Supabase table's queries | `lib/supabase/queries/` — and mirror it in `lib/db/repositories/` |
| A calculation with no UI (e.g. a new stat formula) | `lib/` — new subfolder if it doesn't fit an existing one |
| A value used in more than one file (a color, an icon list) | `constants/` |
| The shape of a piece of data | `types/` |
| Something that needs to persist across app restarts, app-wide | `store/` |
| Something that's just "what's on screen right now," one screen only | Local `useState` inside that screen — doesn't need its own file at all |
