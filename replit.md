# LifeOS

A personal second-brain and university archive — a full-stack web app where a student logs and revisits their entire university journey: memories, notes, academic progress, achievements, projects, friends, daily journal, and letters to future self.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter (routing) + TanStack Query + Framer Motion + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/life-os/src/pages/` — all 12 page components
- `artifacts/life-os/src/components/layout/` — AppLayout, Sidebar
- `artifacts/life-os/src/components/ui/glass.tsx` — GlassCard, GlassPanel (core design components)
- `lib/db/src/schema/` — all 12 Drizzle table schemas
- `artifacts/api-server/src/routes/` — all route handlers (memories, notes, subjects, assignments, exams, achievements, projects, bucketlist, friends, journal, mood, future-letters, stats)
- `lib/api-client-react/src/generated/` — auto-generated TanStack Query hooks

## Architecture decisions

- Contract-first: OpenAPI spec → Orval codegen → typed React hooks + Zod schemas. Never hand-write fetch calls.
- Dark-mode only glassmorphism design. Colors: background `#07080F`, cyan `#6CE5D8`, violet `#9B86F2`, coral `#F2879B`, gold `#E8C27A`.
- Fonts: Space Grotesk (display/headings), Inter (body), JetBrains Mono (monospace/dates).
- Future letters: content is hidden (returned as null) by the API until the unlock date passes — the privacy is enforced server-side.
- Journal entries are upserted by date (one entry per calendar day).

## Product

12 fully functional sections:
1. **Home** — dashboard with upcoming assignments, recent notes, latest memories, mood picker
2. **Memories** — Timeline/Gallery/Calendar/Year View with "On This Day" feature
3. **Smart Notes** — group-based note-taking with tag filtering and URL linking
4. **University** — Subjects table, Kanban-style assignments, exam countdown, GPA/CGPA line chart
5. **Achievements** — timeline of milestones with icons and categories
6. **Projects** — archive of built projects with GitHub/live links and tech tags
7. **Bucket List** — checklist with progress bar and target dates
8. **Statistics** — counts of all entities, mood distribution bar chart
9. **Daily Journal** — mood picker + 4 text fields, pre-populated with today's entry
10. **Friends Archive** — card grid with avatars, department, birthday, notes
11. **Future Letters** — sealed/unlocked state, content hidden until unlock date
12. **Settings** — accent color presets, animation speed, data export

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/db run push` after schema changes, then restart API workflow.
- Run `pnpm --filter @workspace/api-spec run codegen` after OpenAPI spec changes before editing frontend.
- The API server must be restarted after route changes (it compiles with esbuild on start).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
