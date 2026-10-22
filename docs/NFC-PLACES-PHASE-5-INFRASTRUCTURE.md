# Phase 5 — Retiring worker infrastructure

Removed from application/runtime configuration:

- `playwright-core` production dependency (Playwright remains a development-only E2E tool).
- Worker/probe/backfill npm scripts and their worker-only source files.
- Queue polling behavior at `/api/resolve/[token]` (the path remains as a small `410 Gone` response for stale clients).
- systemd worker/heartbeat examples and worker deployment directory.
- Playwright runtime externalization from `next.config.ts`.

The synchronous `/api/resolve` route performs bounded HTTP redirect handling and a single Places lookup. It has no persistent queue, polling loop, Chromium process, heartbeat prerequisite, permanent worker, or VPS requirement.

Historical migrations v7–v8 and their `resolution_jobs`, `resolution_audit`, and `resolver_workers` tables are retained. No destructive migration or historical data cleanup was performed. `@playwright/test` remains a dev dependency for browser E2E; Next.js also declares it as an optional peer, so npm may install the package transitively. The app does not import Playwright or Chromium in its production routes, and no browser binary or worker is needed to run the new resolver.
