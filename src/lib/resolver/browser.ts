// Server-only module (launches Chromium); never import from client code.
import { existsSync } from 'node:fs';
import { placeIdFromUrlCandidates, bestPlaceIdFromText, identityFromHtml, firstMeaningfulName, addressFromMapsPayload, isPlausiblePlaceId, type ResolvedIdentity } from './extract';
import type { ResolverConfig } from './types';

export interface BrowserOutcome {
  placeId: string | null;
  finalUrl: string;
  identity: ResolvedIdentity;
  blocked: boolean;
  errorCode: 'browser_unavailable' | 'timeout' | 'google_blocked' | 'internal_error' | null;
}

/* Minimal structural typings for the dynamically imported Playwright driver. */
interface BrowserLike {
  newContext(opts: Record<string, unknown>): Promise<ContextLike>;
  close(): Promise<void>;
}
interface ContextLike {
  newPage(): Promise<PageLike>;
  close(): Promise<void>;
}
interface ResponseLike {
  url(): string;
  headers(): Record<string, string>;
  text(): Promise<string>;
}
interface RequestLike {
  url(): string;
}
interface PageLike {
  goto(url: string, opts?: Record<string, unknown>): Promise<unknown>;
  content(): Promise<string>;
  url(): string;
  title(): Promise<string>;
  close(): Promise<void>;
  waitForTimeout(ms: number): Promise<void>;
  evaluate<T>(fn: () => T): Promise<T>;
  on(event: 'request', handler: (req: RequestLike) => void): void;
  on(event: 'response', handler: (res: ResponseLike) => void): void;
}
type ChromiumModule = { launch(opts: Record<string, unknown>): Promise<unknown> };

/** Google Maps' internal endpoint that returns the place payload (contains the real Place ID). */
const PLACE_PAYLOAD = /\/maps\/preview\/place|\/maps\/rpc\/|writereview|search\.google\.com\/local/;
const MAX_BODY_READS = 40;
const MAX_BODY_BYTES = 3_000_000;

/**
 * Launch headless Chromium and read the genuine Place ID from Google Maps traffic.
 *
 * One isolated browser context per resolution; the browser and context are always closed in
 * `finally`, so a completed or failed resolution never leaves a browser process behind. We do
 * NOT attempt CAPTCHA bypass, stealth evasion or proxy rotation — if Google shows an
 * interstitial we report `google_blocked` and stop.
 */
export async function resolveWithBrowser(inputUrl: string, config: ResolverConfig): Promise<BrowserOutcome> {
  const outcome: BrowserOutcome = {
    placeId: null,
    finalUrl: inputUrl,
    identity: { name: null, address: null },
    blocked: false,
    errorCode: null,
  };

  let browser: BrowserLike | null = null;
  let context: ContextLike | null = null;
  let page: PageLike | null = null;
  const deadline = Date.now() + config.timeoutMs;

  // Candidate Place IDs collected from Google's own request URLs and response bodies.
  const candidates = new Set<string>();
  let bodyReads = 0;
  let placePayload = '';

  try {
    const chromium = await loadChromium();
    if (!chromium) {
      outcome.errorCode = 'browser_unavailable';
      return outcome;
    }

    const launchOptions: Record<string, unknown> = {
      headless: config.headless,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-background-networking', '--no-first-run'],
    };
    const executablePath = config.browserPath || detectBrowserPath();
    if (executablePath) launchOptions.executablePath = executablePath;

    browser = (await chromium.launch(launchOptions)) as BrowserLike;
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
      locale: 'en-US',
      javaScriptEnabled: true,
    });
    page = await context.newPage();

    const recordUrl = (value: string) => {
      const id = placeIdFromUrlCandidates(value);
      if (id) candidates.add(id);
    };
    const recordText = (value: string) => {
      if (value.length > MAX_BODY_BYTES) return;
      const id = bestPlaceIdFromText(value);
      if (id) candidates.add(id);
    };

    page.on('request', (req) => recordUrl(req.url()));
    page.on('response', (res) => {
      const url = res.url();
      recordUrl(url);
      // Read the body of Google's place payload / review-flow responses to find the Place ID.
      const interesting = PLACE_PAYLOAD.test(url);
      if (!interesting || bodyReads >= MAX_BODY_READS) return;
      bodyReads++;
      void res
        .text()
        .then((body) => {
          recordText(body);
          if (/\/maps\/preview\/place/.test(url)) placePayload = body;
        })
        .catch(() => undefined);
    });

    try {
      await page.goto(inputUrl, { waitUntil: 'domcontentloaded', timeout: Math.max(5000, deadline - Date.now()) });
    } catch (err) {
      if (isTimeout(err)) {
        outcome.errorCode = 'timeout';
        return outcome;
      }
      /* navigation errors are not fatal; continue with whatever loaded */
    }

    // Give Maps' JS a chance to fetch the place payload (which carries the Place ID) and render
    // the place panel (which carries the business name/address).
    await waitForCandidates(candidates, deadline, 9000, 3000);

    outcome.finalUrl = safeUrl(page) || inputUrl;
    recordUrl(outcome.finalUrl);

    const html = await safeContent(page);
    if (looksBlocked(outcome.finalUrl, html)) {
      outcome.blocked = true;
      outcome.errorCode = 'google_blocked';
      return outcome;
    }
    recordText(html);

    const htmlIdentity = identityFromHtml(html);
    const domIdentity = await domIdentityFromPage(page);
    outcome.identity = {
      name: firstMeaningfulName([domIdentity.name, htmlIdentity.name, stripMapsSuffix(await safeTitle(page))]),
      address: domIdentity.address ?? htmlIdentity.address ?? addressFromMapsPayload(placePayload),
    };

    let placeId = firstCandidate(candidates);
    if (!placeId) {
      placeId = await tryRevealReviewFlow(page, candidates, deadline);
    }

    outcome.placeId = placeId && isPlausiblePlaceId(placeId) ? placeId : null;
    if (!outcome.placeId) outcome.errorCode = 'google_blocked';
    return outcome;
  } catch (err) {
    outcome.errorCode = isTimeout(err) ? 'timeout' : 'internal_error';
    return outcome;
  } finally {
    await closeQuietly(page);
    await closeQuietly(context);
    await closeQuietly(browser);
  }
}

/**
 * Poll the candidate set until a Place ID appears AND at least `minMs` has elapsed (so the
 * place panel has time to render for identity capture), or the budget elapses.
 */
async function waitForCandidates(candidates: Set<string>, deadline: number, maxMs: number, minMs = 0): Promise<void> {
  const start = Date.now();
  const until = Math.min(deadline, start + maxMs);
  while (Date.now() < until) {
    if (candidates.size > 0 && Date.now() - start >= minMs) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

function firstCandidate(candidates: Set<string>): string | null {
  for (const id of candidates) if (isPlausiblePlaceId(id)) return id;
  return null;
}

async function tryRevealReviewFlow(page: PageLike, candidates: Set<string>, deadline: number): Promise<string | null> {
  try {
    const before = safeUrl(page);
    const clicked = await page.evaluate(() => {
      const re = /(write a review|ulasan|beri ulasan|tulis ulasan)/i;
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('button, a, [role="button"]'));
      for (const el of nodes) {
        const text = (el.getAttribute('aria-label') || el.textContent || '').trim();
        if (text && re.test(text) && text.length < 60) {
          el.click();
          return true;
        }
      }
      return false;
    });
    if (!clicked) return firstCandidate(candidates);
    const until = Math.min(deadline, Date.now() + 4000);
    while (Date.now() < until) {
      await page.waitForTimeout(300);
      const existing = firstCandidate(candidates);
      if (existing) return existing;
      const after = safeUrl(page);
      if (after && after !== before) {
        const id = placeIdFromUrlCandidates(after);
        if (id) return id;
      }
    }
    return firstCandidate(candidates) ?? bestPlaceIdFromText(await safeContent(page));
  } catch {
    return firstCandidate(candidates);
  }
}

function stripMapsSuffix(title: string): string | null {
  const value = (title || '').replace(/\s*-\s*Google( Maps)?\s*$/i, '').trim();
  return value || null;
}

/** Read the business name/address from the live Maps place panel. */
async function domIdentityFromPage(page: PageLike): Promise<ResolvedIdentity> {
  try {
    return await page.evaluate(() => {
      const clean = (value: string | null | undefined) => (value || '').replace(/\s+/g, ' ').trim();
      const heading = document.querySelector('h1');
      const name = heading ? clean(heading.textContent) : null;
      const addrEl = document.querySelector('[data-item-id="address"]') as HTMLElement | null;
      let address = addrEl ? clean(addrEl.getAttribute('aria-label')) : null;
      address = address ? address.replace(/^Address:\s*/i, '') || null : null;
      return { name: name || null, address: address || null };
    });
  } catch {
    return { name: null, address: null };
  }
}

function safeUrl(page: PageLike): string {
  try {
    return page.url();
  } catch {
    return '';
  }
}

async function safeContent(page: PageLike): Promise<string> {
  try {
    return await page.content();
  } catch {
    return '';
  }
}

async function safeTitle(page: PageLike): Promise<string> {
  try {
    return await page.title();
  } catch {
    return '';
  }
}

function looksBlocked(url: string, html: string): boolean {
  const u = url.toLowerCase();
  if (u.includes('consent.google.com') || u.includes('/sorry/') || u.includes('captcha')) return true;
  return /unusual traffic|our systems have detected/i.test(html);
}

async function closeQuietly(target: { close(): Promise<void> } | null): Promise<void> {
  if (!target) return;
  try {
    await target.close();
  } catch {
    /* ignore */
  }
}

function isTimeout(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /timeout|timed out/i.test(message);
}

/** Dynamically import Playwright so it never becomes part of the client or the default bundle. */
async function loadChromium(): Promise<ChromiumModule | null> {
  for (const mod of ['playwright-core', 'playwright']) {
    try {
      const imported = (await import(/* webpackIgnore: true */ mod)) as { chromium?: ChromiumModule };
      if (imported?.chromium?.launch) return imported.chromium;
    } catch {
      /* try the next module */
    }
  }
  return null;
}

function detectBrowserPath(): string | null {
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ];
  for (const path of candidates) {
    try {
      if (existsSync(path)) return path;
    } catch {
      /* ignore */
    }
  }
  return null;
}
