# NexusCRM Trading Backoffice

Production foundation for converting the static HTML CRM prototype into a modular trading CRM/backoffice application.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui-style component primitives
- Zustand for app/UI state
- React Query for server state
- Framer Motion for live UI transitions
- Recharts for analytics
- Prisma ORM with PostgreSQL

## Structure

```txt
src/
  app/                  Next.js app entry, providers, global theme
    api/auth/           JWT auth, refresh, logout, password reset
  components/
    auth/               Auth shell and session provider
    layout/             App shell, sidebar, topbar
    ui/                 shadcn/ui-compatible primitives
  config/               Environment parsing
  features/
    dashboard/          Trading dashboard module
  lib/
    api/                API client foundation
    auth/               JWT, cookies, RBAC, session, audit helpers
    utils.ts            Shared utilities
  stores/               Zustand stores
prisma/
  schema.prisma         PostgreSQL schema foundation
```

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:seed
npm run prisma:generate
```

Copy `.env.example` to `.env.local` for local database and service secrets.

## Authentication

- Access tokens are signed JWTs stored in an HTTP-only cookie.
- Refresh tokens are opaque, hashed in PostgreSQL, and rotated on refresh.
- Login, logout, current session, forgot password, and reset password endpoints live under `/api/auth`.
- Middleware protects application routes and applies RBAC permission policies for CRM, analytics, KYC, finance, platform, and API areas.
- Auth events are written into `AuditLog` for successful login, failed login, blocked login, logout, refresh rotation, refresh reuse detection, and password resets.

Seed the default tenant, RBAC permissions, demo roles, and local demo users after configuring `DATABASE_URL`:

```bash
npm run prisma:migrate
npm run db:seed
```

Local demo sign-in uses tenant `default`:

```txt
Admin: admin@nexuscrm.local / Password123!
Manager: manager@nexuscrm.local / Password123!
Support: support@nexuscrm.local / Password123!
```
