// Non-destructive destination backfill.
//
// Finds active cards whose stored destination is a Google Maps place/share link (not an official
// review URL), resolves each to a genuine review URL, and — only with explicit approval — updates
// the card in place. It never deletes cards, never changes card codes, never resets activation or
// visit history, and never overwrites a destination silently.
//
//   npm run resolver:backfill                       # dry run (default): plan only, no writes
//   npm run resolver:backfill -- --apply            # shows what WOULD change, still no writes
//   npm run resolver:backfill -- --apply --yes       # performs the updates (explicit approval)
//   npm run resolver:backfill -- --card=RP-XXXXXXXXXX --apply --yes
//
// Requires PLAYWRIGHT_RESOLVER_ENABLED=1 (the resolver kill switch) and network access to Google.

import 'dotenv/config';
import { Pool } from 'pg';
import { resolverConfig, isEnabled } from '../src/lib/resolver/config';
import { resolveGoogleReviewUrl } from '../src/lib/resolver/index';
import { writeAudit } from '../src/lib/resolver/jobs';
import { createPgJobsDb } from '../src/lib/resolver/pg-store';
import { isOfficialReviewUrl } from '../src/lib/resolver/url-policy';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const confirmed = args.includes('--yes');
const cardArg = args.find((a) => a.startsWith('--card='))?.split('=')[1];
const limitArg = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || 50);

const config = resolverConfig();

interface TargetCard { id: number | string; code: string; review_url: string }

async function main() {
  if (!isEnabled()) {
    console.error('[backfill] PLAYWRIGHT_RESOLVER_ENABLED is not set to 1 — refusing to run (kill switch).');
    process.exit(1);
  }
  const DATABASE_URL = process.env.DATABASE_URL?.trim();
  if (!DATABASE_URL) { console.error('[backfill] DATABASE_URL is not set.'); process.exit(1); }

  const demo = process.env.DEMO_MODE === 'true';
  const pool = new Pool({ connectionString: DATABASE_URL, max: 2, application_name: 'repiw-resolver-backfill' });
  const db = createPgJobsDb(pool);

  const params: unknown[] = [demo ? 1 : 0];
  let where = `demo=? AND active=1 AND review_url IS NOT NULL
    AND review_url NOT LIKE 'https://search.google.com/local/writereview%'
    AND review_url NOT LIKE 'https://g.page/r/%/review%'`;
  if (cardArg) { where += ' AND code=?'; params.push(cardArg); }
  params.push(Number.isFinite(limitArg) ? limitArg : 50);

  const cards = await db.query<TargetCard>(`SELECT id,code,review_url FROM cards WHERE ${where} ORDER BY id DESC LIMIT ?`, params);
  console.log(`[backfill] mode=${apply && confirmed ? 'APPLY' : 'DRY-RUN'} candidates=${cards.length} demo=${demo}`);
  if (!cards.length) { await pool.end(); return; }

  const planned: Array<{ card: TargetCard; newUrl: string | null; placeId: string | null; name: string | null; status: string }> = [];

  for (const card of cards) {
    try {
      const result = await resolveGoogleReviewUrl(card.review_url, { ...config, enabled: true });
      const ok = result.status === 'success' && result.reviewUrl && isOfficialReviewUrl(result.reviewUrl);
      planned.push({
        card,
        newUrl: ok ? result.reviewUrl! : null,
        placeId: result.placeId,
        name: result.businessName,
        status: ok ? 'ok' : result.status,
      });
      console.log(`  ${card.code}  ${ok ? 'OK' : result.status.toUpperCase()}  ${card.review_url}`);
      if (ok) console.log(`      -> ${result.reviewUrl}  (${result.businessName ?? 'unknown business'})`);
      else console.log(`      !! unresolved (${result.errorCode ?? 'unknown'}) — left unchanged`);
    } catch (error) {
      planned.push({ card, newUrl: null, placeId: null, name: null, status: 'error' });
      console.log(`  ${card.code}  ERROR  ${error instanceof Error ? error.message : 'unexpected error'}`);
    }
  }

  const applicable = planned.filter((p) => p.newUrl);
  console.log(`[backfill] resolved ${applicable.length}/${planned.length}; ${apply && confirmed ? 'applying' : 'no writes'}`);

  if (!apply || !confirmed) {
    if (apply && !confirmed) console.log('[backfill] --apply was given without --yes; refusing to write. Re-run with --apply --yes to confirm.');
    await pool.end();
    return;
  }

  let updated = 0;
  for (const item of applicable) {
    try {
      await db.transaction(async (tx) => {
        await tx.execute(
          `UPDATE cards SET review_url=?,place_id=?,source_url=?,resolution_status='verified',resolution_method=?,resolved_at=CURRENT_TIMESTAMP,resolved_business_name=?,resolved_business_address=? WHERE id=?`,
          [item.newUrl, item.placeId, item.card.review_url, 'backfill', item.name, null, item.card.id],
        );
        await writeAudit(tx, {
          actor: 'backfill',
          action: 'destination.backfill',
          cardCode: item.card.code,
          oldUrl: item.card.review_url,
          newUrl: item.newUrl,
          placeId: item.placeId,
          detail: 'non-destructive destination update',
        });
      });
      updated++;
      console.log(`  updated ${item.card.code}`);
    } catch (error) {
      // Failure isolation: one card failing never blocks the rest.
      console.log(`  FAILED ${item.card.code}: ${error instanceof Error ? error.message : 'unexpected error'}`);
    }
  }
  console.log(`[backfill] updated ${updated} card(s). Audit rows written to resolution_audit.`);
  await pool.end();
}

main().catch(async (error) => {
  console.error('[backfill] fatal:', error instanceof Error ? error.message : error);
  process.exit(1);
});
