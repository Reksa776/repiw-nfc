// Live resolver probe / measurement tool.
//
// Runs the resolver against a real Google Maps URL and reports duration and memory. This is a
// LIVE, network-dependent tool — it is NOT part of the automated test suite. Requires the
// resolver to be enabled explicitly via PLAYWRIGHT_RESOLVER_ENABLED=1.
//
//   PLAYWRIGHT_RESOLVER_ENABLED=1 npm run resolver:probe -- https://maps.app.goo.gl/HihE1JQdDmzBDCVC8

import 'dotenv/config';
import { execSync } from 'node:child_process';
import { resolveGoogleReviewUrl } from '../src/lib/resolver/index';

const url = process.argv[2] || 'https://maps.app.goo.gl/HihE1JQdDmzBDCVC8';

function browserRssKb(): number {
  try {
    // Match only Playwright's own Chromium instances (identified by its temp profile dir), so
    // unrelated desktop browsers are not counted.
    const out = execSync('ps -eo rss=,args=', { encoding: 'utf8' });
    let total = 0;
    for (const line of out.split('\n')) {
      if (!line.includes('playwright_chromiumdev_profile')) continue;
      const m = line.trim().match(/^(\d+)\s/);
      if (m) total += Number(m[1]);
    }
    return total;
  } catch {
    return 0;
  }
}

async function main() {
  const memBefore = process.memoryUsage().rss;
  let peakBrowserKb = browserRssKb();
  const sampler = setInterval(() => {
    peakBrowserKb = Math.max(peakBrowserKb, browserRssKb());
  }, 150);

  const start = Date.now();
  const result = await resolveGoogleReviewUrl(url, { enabled: true, timeoutMs: Number(process.env.RESOLVER_TIMEOUT_MS || 60000) });
  const durationMs = Date.now() - start;

  clearInterval(sampler);
  await new Promise((r) => setTimeout(r, 500));
  const browserAfter = browserRssKb();
  const nodeAfter = process.memoryUsage().rss;

  console.log(
    JSON.stringify(
      {
        input: url,
        status: result.status,
        method: result.method,
        placeId: result.placeId,
        reviewUrl: result.reviewUrl,
        businessName: result.businessName,
        businessAddress: result.businessAddress,
        resolvedUrl: result.resolvedUrl,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        durationMs,
        nodeRssDeltaMB: ((nodeAfter - memBefore) / 1048576).toFixed(1),
        peakBrowserRssMB: (peakBrowserKb / 1024).toFixed(1),
        browserRssAfterMB: (browserAfter / 1024).toFixed(1),
        leftOverBrowserProcesses: browserAfter > 0,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error('probe failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
