import type { ResolverConfig } from './types';

/**
 * Read the resolver configuration from the environment.
 *
 * The resolver is DISABLED by default (`PLAYWRIGHT_RESOLVER_ENABLED=0`). Enabling it is the
 * deliberate opt-in that also acts as the global kill switch: setting it back to 0 stops all
 * browser work immediately without a redeploy of route logic.
 */
export function resolverConfig(): ResolverConfig {
  const enabled = isEnabled();
  const timeoutMs = clampInt(process.env.RESOLVER_TIMEOUT_MS, 45_000, 5_000, 180_000);
  const maxConcurrency = clampInt(process.env.RESOLVER_MAX_CONCURRENCY, 1, 1, 4);
  const browserPath = (process.env.PLAYWRIGHT_BROWSER_PATH || process.env.CHROME_BIN || '').trim() || null;
  const headless = process.env.RESOLVER_HEADLESS !== 'false';
  const placesApiKey = (process.env.GOOGLE_MAPS_API_KEY || '').trim() || null;
  return { enabled, timeoutMs, maxConcurrency, browserPath, headless, placesApiKey };
}

export function isEnabled(): boolean {
  return process.env.PLAYWRIGHT_RESOLVER_ENABLED === '1' || process.env.PLAYWRIGHT_RESOLVER_ENABLED === 'true';
}

export function isPlacesApiConfigured(): boolean {
  return Boolean((process.env.GOOGLE_MAPS_API_KEY || '').trim());
}

function clampInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
