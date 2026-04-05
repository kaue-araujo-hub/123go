# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### 123GO! — Plataforma de Jogos de Matemática (`artifacts/123go`)
- React + Vite frontend-only app (no backend)
- **21 interactive math games** for Brazilian elementary school students (1st year focus)
- Aligned with the Currículo Paulista / BNCC
- Catalog page with filtering by bimestre, tema, search, and pagination
- GameShell + useGameEngine system for all game pages (5 phases each)
- Dependencies: `canvas-confetti`, `gsap`, `wouter`, `framer-motion`
- Game files in `artifacts/123go/src/games/`
- Data in `artifacts/123go/src/data/games.ts`
- Engine in `artifacts/123go/src/engine/GameEngine.tsx`
- Components in `artifacts/123go/src/components/`
- Router wired in `artifacts/123go/src/App.tsx`

**Timer System (complete)**
- `src/engine/TimerSystem.ts` — pure class, `performance.now()` precision
- `src/engine/TimerStore.ts` — localStorage persistence, analytics singleton
- `src/hooks/useTimer.ts` — React hook for phase/game timing
- `src/components/TimerDisplay.tsx` — child-friendly `⏱ mm:ss` with spring-tick animation + lowTime urgency styling (red shake when < 10s)
- `src/components/PhaseResults.tsx` — end-of-game overlay with phase breakdown and personal best badge

**Modalidades de Aula (complete) — route `/professor`**
- `src/auth/SessionManager.ts` — PIN auth (default: `1234`), role/mode/session management
- `src/engine/ModeConfig.ts` — MODE_META, CHALLENGE_CONFIG, TIME_CONFIG, PRACTICE_CONFIG; `getModeConfig()`, `randomInRange()`
- `src/hooks/useGameMode.ts` — reactive hook, cross-tab via StorageEvent
- `src/components/ModalitySelector/ModalitySelector.tsx` — teacher panel with animated mode carousel + difficulty pills
- `src/components/ModalitySelector/ModalityCard.tsx` — 3D tilt on hover, CSS vars `--mode-color`/`--mode-bg`
- `src/components/ModeBadge.tsx` — pulsing dot badge in game top bar; hidden in practice mode (default)
- `src/pages/TeacherDashboard.tsx` — PIN login + ModalitySelector + session export panel
- **Countdown timer in Modo Tempo**: game top bar shows countdown (counting down from timeLimitSeconds) instead of stopwatch; turns red + shakes at ≤ 10s
- **Events**: `123go:mode-changed`, `123go:difficulty-changed`, `123go:role-changed`, `123go:session-started`
