# Restaurant Operations Management — Frontend

Next.js 16 (App Router) frontend for the Restaurant Operations Management System. Talks to the NestJS backend in `../backend` — this app never calls it directly from the browser; every request goes through a Server Component, Server Action, or Route Handler so the backend JWT never leaves the server.

## Environment variables

Create `.env.local` (see `.env.local` for the current dev value):

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `BACKEND_API_URL` | No | `http://localhost:3001` | Base URL of the NestJS backend API. Used by every server-side fetch — `lib/api/client.ts`, the login Server Action, and the uploads/report-export/audit-log-export Route Handlers. Set this to the backend's real URL in any environment where it isn't running on `localhost:3001` (e.g. the production Docker Compose network, where it would point at the backend container's service name). |

No other environment variables are read by this app. In particular there is no frontend-side session secret — the `session` cookie holds the backend's own JWT verbatim (see `lib/auth/session.ts`), and the backend is the only thing that ever verifies it.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The backend (`../backend`) and a Postgres instance must already be running — see the backend's own README for that setup.

## Production build

```bash
npm run build
npm run start
```

`next.config.ts` sets `output: "standalone"`, so `npm run build` also produces `.next/standalone/server.js` — a self-contained Node server with its own minimal `node_modules`, which is what `Dockerfile` copies into the production image (see `Dockerfile` for the exact two-stage build).

## Architecture notes

- `lib/api/client.ts` is the one place that ever calls the backend. It attaches the session JWT and current branch header, and throws a typed `ApiError` for any non-2xx response.
- `lib/server/<module>/{queries.ts,actions.ts}` hold every module's typed GET calls and `'use server'` mutations — see any existing module for the pattern before adding a new one.
- `components/shared/` holds the cross-cutting pieces every module screen is built from (`DataTable`, `ApprovalQueue`, `StatusStepper`, `PermissionGate`, `AccessDenied`, the report components, etc.).
- `(app)/error.tsx`, `(app)/not-found.tsx`, and `(app)/loading.tsx` are scoped to the authenticated shell, so the sidebar/topbar stay mounted while only the page content swaps — the root-level `not-found.tsx` handles a URL that matches no route at all, outside that shell.
- A page that already knows it's rejecting access for a specific permission (e.g. a report page) should catch that and render `AccessDenied`/`ReportAccessError` inline rather than throwing — Next.js redacts a thrown error's real message down to an opaque digest by the time it reaches `error.tsx` in production, so the generic boundary is a last resort for genuine crashes, not a 403 presentation mechanism.
