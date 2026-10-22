# NFC Google Review resolver roadmap

Updated 2026-10-19. The new resolver replaces the previous worker-based design in application code. No production database, Vercel setting, or deployment was changed.

| Phase | Status | Report |
|---|---|---|
| 1. Repository and migration audit | Complete | [Phase 1](NFC-PLACES-PHASE-1-AUDIT.md) |
| 2. HTTP-only Maps link expansion | Implemented; automated and live edge cases still need verification | [Phase 2](NFC-PLACES-PHASE-2-HTTP-RESOLVER.md) |
| 3. Places API New IDs Only | Implemented with `places.id` only; credentials/live call not available here | [Phase 3](NFC-PLACES-PHASE-3-GOOGLE-API.md) |
| 4. Activation and admin integration | Implemented; tests pending | [Phase 4](NFC-PLACES-PHASE-4-ACTIVATION.md) |
| 5. Worker retirement | Runtime dependency and worker routes/scripts removed; historical migrations/tables retained | [Phase 5](NFC-PLACES-PHASE-5-INFRASTRUCTURE.md) |
| 6. Vercel/Supabase deployment plan | Prepared; no live changes | [Phase 6](NFC-PLACES-PHASE-6-DEPLOYMENT.md) |
| 7. Verification | In progress / final results recorded after checks | [Phase 7](NFC-PLACES-PHASE-7-VERIFICATION.md) |

## Current operator action

Keep `GOOGLE_PLACES_RESOLVER_ENABLED=0` until a staging deployment has a restricted `GOOGLE_PLACES_API_KEY`, the database is at migration v8, and actual business candidates are manually verified in Maps. Direct Google Review URL activation remains available. The current price sheet associates the exact `places.id` Text Search field mask with Text Search Essentials (IDs Only); billing must still be enabled and current regional pricing must be checked.
