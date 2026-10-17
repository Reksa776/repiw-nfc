# NFC Auto Phase 4 — Database and Deployment Readiness

| | |
|---|---|
| **Date** | 2026-10-17 |
| **Status** | **CONDITIONAL** — code ready, production dependencies not applied |
| **Production schema (read-only check)** | **version 5** (requires 8) |
| **Production migrations executed** | **NONE** |
| **Production resolver enabled** | **NO** (`PLAYWRIGHT_RESOLVER_ENABLED` default 0) |
| **Deployment performed** | **NONE** |

## 1. Migration inventory

`scripts/migrate-postgres.js` contains 8 idempotent, versioned migrations:

| Version | Name | Additive content |
|---|---|---|
| 1 | `initial_supabase_schema` | cards, visits, admins, sessions, rate_events, schema_migrations, data_imports |
| 2 | `attach_sessions_to_admins` | sessions.admin_id, index |
| 3 | `normalize_card_flags` | `active` boolean → smallint |
| 4 | `track_nfc_card_programming` | `cards.nfc_registered_at` |
| 5 | `retain_encrypted_activation_codes` | `cards.activation_code_encrypted` |
| 6 | `card_destination_provenance` | nullable `place_id`, `source_url`, `resolution_status`, `resolution_method`, `resolved_at`, `resolved_business_name`, `resolved_business_address` |
| 7 | `resolution_jobs_and_audit` | `resolution_jobs`, partial unique active-job index, `resolution_audit` |
| 8 | `resolver_worker_heartbeat` | `resolver_workers` |

Migrations 6–8 add columns/tables only. They do not update or delete existing cards, destinations,
activation state, or visits.

## 2. Current production state (read-only)

`npm run db:status` connects, runs `SELECT`s only, and prints no credentials. Result:

```json
{
  "ok": false,
  "schemaVersion": 5,
  "requiredVersion": 8,
  "resolverTables": { "resolution_jobs": false, "resolution_audit": false, "resolver_workers": false },
  "cards": { "total": 10, "active": 4 },
  "note": "Schema is NOT ready..."
}
```

This confirms the audit and the production blocker. Nothing was migrated.

## 3. Migration compatibility test (throwaway database)

A disposable in-process PostgreSQL was built at **version 5** with:

- one **active** card (`RP-AAAAAAAAAA`) whose destination was an existing review URL,
- two visits (NFC + QR),
- then the **real** `scripts/migrate-postgres.js` runner was executed twice.

Result:

```json
{
  "firstRunExit": 0,
  "schemaVersion": 8,
  "secondRunExit": 0,
  "secondRunStderr": "",
  "card": {
    "active": 1,
    "review_url": "https://search.google.com/local/writereview?placeid=ChIJExistingPlaceId123456",
    "place_id": null,
    "resolution_status": null,
    "source_url": null,
    "resolved_business_name": null
  },
  "visits": 2,
  "resolverTables": ["resolution_audit", "resolution_jobs", "resolver_workers"]
}
```

Conclusions:

- v5 → v8 upgrade succeeds and is **idempotent** on the second run.
- Existing active card destination is unchanged.
- Visit analytics are unchanged.
- New provenance columns stay `NULL` for legacy cards.
- All three resolver tables are created.

Additionally, the full 8-migration chain was applied to a clean PostgreSQL (`schemaVersion: 8`) and
the mocked e2e suite ran against it, including job lifecycle, expiry, duplicate blocking and
activation.

## 4. Backup procedure (prepared, not executed against production)

Prerequisite: install `pg_dump` (`postgresql-client`); it is currently absent on this host.

```bash
# 1. verify connectivity and current schema (read-only)
npm run db:status

# 2. create a compressed logical backup; 0600; URL passed via PGDATABASE, never argv
npm run db:backup
#    → backups/repiw-<timestamp>.sql.gz

# 3. copy off-host and verify integrity WITHOUT restoring
gunzip -t backups/repiw-<timestamp>.sql.gz
sha256sum backups/repiw-<timestamp>.sql.gz
```

For an independent pre-migration backup, the provider's snapshot/point-in-time backup should also be
taken. Keep the backup until after the smoke test.

## 5. Migration procedure (requires explicit approval)

```bash
# maintenance window; resolver must be OFF in Vercel and on the worker host
npm run db:status                 # expect ok:false, schemaVersion:5
npm run db:migrate                # expect schemaVersion:8, no errors
npm run db:status                 # expect ok:true, resolver tables true
# deploy/restart the app, start the worker, then enable the kill switch
```

`db:migrate` is additive and rerunnable. Do **not** run it without approval and a backup.

## 6. Rollback

| Scenario | Action |
|---|---|
| Migration succeeded, feature must be disabled | Set `PLAYWRIGHT_RESOLVER_ENABLED=0` in Vercel and on the worker host; stop the worker. No schema rollback needed. |
| App code must be reverted | Redeploy the previous Vercel build. Old code ignores the new nullable columns/tables. |
| Migration failed | The runner wraps each migration in a transaction; it rolls back that migration. Fix the cause and rerun; already-applied versions are skipped. |
| Data must be restored | Restore the verified backup into a **new** database first, validate, then switch `DATABASE_URL`. Do not drop production tables in place. |

Never drop `resolution_jobs`, `resolution_audit`, `resolver_workers`, or the provenance columns as a
rollback shortcut: they are additive and existing cards/analytics must be preserved.

## 7. Vercel settings (names only)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | same database as the worker; server-only |
| `SESSION_SECRET` | yes | ≥ 32 random bytes |
| `BASE_URL` | yes | HTTPS production origin |
| `PLAYWRIGHT_RESOLVER_ENABLED` | yes | `0` until approval; `1` only after migrations + worker are healthy |
| `RESOLVER_TIMEOUT_MS` | optional | default 45000 |
| `RESOLVER_MAX_CONCURRENCY` | optional | keep 1 |
| `PG_POOL_SIZE`, `DEMO_MODE`, `TRUST_PROXY` | existing | unchanged |
| `GOOGLE_MAPS_API_KEY` | **not required** | optional confirmation/enrichment only |

Vercel must **not** receive `PLAYWRIGHT_BROWSER_PATH`, and no Chromium runs there.

## 8. Worker environment (names only)

`DATABASE_URL`, `PLAYWRIGHT_RESOLVER_ENABLED`, `RESOLVER_TIMEOUT_MS`,
`RESOLVER_MAX_CONCURRENCY`, `RESOLVER_HEADLESS`, `RESOLVER_POLL_MS`,
`PLAYWRIGHT_BROWSER_PATH` (optional), `NODE_ENV`, optional `GOOGLE_MAPS_API_KEY`.

Values are never recorded in this repository. See `deploy/resolver-worker.env.example`.

## 9. Connectivity and visibility

| Check | Result |
|---|---|
| PostgreSQL reachable from this worker-capable host | **yes** (read-only query succeeded) |
| Vercel ↔ same database | not deployable from here; requires the existing Vercel env to be confirmed |
| Schema version visible | yes (`npm run db:status`) |
| Worker heartbeat visible | yes (`resolver_workers`, `workerAvailable` in API, `--check`) |
| Resolver disabled until healthy | yes (default 0; API 503, worker refuses to start, backfill refuses) |

## 10. Remaining blockers

1. **Production migrations 6–8 not applied** (schema v5).
2. **No worker provisioned/running** on an external host.
3. Vercel production env values and connectivity not verified from this environment.
4. `pg_dump` missing on the host; install before backup.
5. Explicit approval is still required to migrate, deploy, and enable the resolver.
