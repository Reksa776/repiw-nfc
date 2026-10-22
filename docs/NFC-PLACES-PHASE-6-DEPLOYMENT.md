# Phase 6 — Supabase and Vercel deployment plan

## Configuration

- Existing app variables remain: `DATABASE_URL`, `SESSION_SECRET`, `BASE_URL`, `NODE_ENV`, `DEMO_MODE`, and optional `TRUST_PROXY`.
- Add server-only `GOOGLE_PLACES_API_KEY`; enable Places API (New), billing, API restrictions and quota alerts in Google Cloud.
- Add `GOOGLE_PLACES_RESOLVER_ENABLED=0` by default. Only staging may set it to `1` after setup. Do not expose either variable as `NEXT_PUBLIC_*`.
- No Playwright browser path, worker service, heartbeat poller, queue consumer, or VPS is needed by the new resolver.

## Database upgrade

The checked-in migration runner has v1–v8. A previously reported production database at v5 is plausible but not verified. Back up first, inspect `schema_migrations`, then run `npm run db:migrate` in a controlled release step. This applies v6 provenance, v7 job/audit, and v8 heartbeat additively; at versions 6/7 it applies only later migrations; v8 is current. No v9 is required because existing v6 columns cover the new provenance. Do not assume migrations were run, and do not run this against production from this agent session.

## Safe rollout

1. Set the feature flag to `0` and deploy to staging.
2. Confirm current schema version 8 and existing card counts/URLs. Test existing active cards and manual direct-review activation.
3. Add the restricted key to staging and set the feature flag to `1` there. Test valid short/full URLs, unsupported/unsafe redirects, no-results, multiple IDs and API errors. Manually compare each candidate in Google Maps.
4. Deploy to production with the feature disabled. Observe manual flow and redirects.
5. After explicit operator approval, enable the feature and monitor API quota/errors. Roll back by setting the flag to `0` and redeploying.

No Supabase or Vercel settings were changed and no production migration was executed. Deployment is not verified or production-ready by this report.
