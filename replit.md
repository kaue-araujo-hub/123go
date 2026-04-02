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
- Dependencies: `canvas-confetti`, `gsap`, `wouter`
- Game files in `artifacts/123go/src/games/`
- Data in `artifacts/123go/src/data/games.ts`
- Engine in `artifacts/123go/src/engine/GameEngine.tsx`
- Components in `artifacts/123go/src/components/`
- Router wired in `artifacts/123go/src/App.tsx`
