// Client-side state machine for the Google Maps resolution flow.
//
// Pure module: no DOM, no React, no network. The activation form and the admin destination editor
// both use it, and it is unit-tested directly, because the production failure mode this hotfix
// fixes was a UI that could wait forever: the poll loop had no request timeout, no worker-liveness
// signal and no mapping for a job that had silently expired.
//
// Every failure maps to one explicit terminal phase, so the UI always leaves "Memproses…".

export type ResolutionPhase =
  | 'idle'
  | 'resolving'
  | 'success'
  | 'inconclusive'
  | 'failed'
  | 'disabled'
  | 'unsupported'
  | 'timeout'
  | 'unavailable'
  | 'worker_unavailable'
  | 'expired'
  | 'rate_limited';

/** Poll cadence while a job is pending/running. */
export const POLL_INTERVAL_MS = 2000;
/** Overall client deadline for a single resolution attempt. */
export const MAX_POLL_MS = 120_000;
/** Timeout for the enqueue request (`POST /api/resolve`). */
export const REQUEST_TIMEOUT_MS = 15_000;
/** Timeout for one status poll, so a stalled response cannot freeze the loop. */
export const POLL_REQUEST_TIMEOUT_MS = 10_000;
/** Give a freshly started worker this long to appear before declaring it missing. */
export const NO_WORKER_GRACE_MS = 5_000;
/** Consecutive failed polls tolerated before the UI reports the service unavailable. */
export const MAX_CONSECUTIVE_POLL_ERRORS = 3;

export interface JobView {
  status?: string | null;
  errorCode?: string | null;
  reviewUrl?: string | null;
  placeId?: string | null;
  businessName?: string | null;
  businessAddress?: string | null;
  expiresAt?: string | null;
  workerAvailable?: boolean | null;
}

export interface ResolveResponseBody {
  code?: string | null;
  error?: string | null;
  jobToken?: string | null;
}

const TERMINAL: ReadonlySet<ResolutionPhase> = new Set<ResolutionPhase>([
  'success', 'inconclusive', 'failed', 'disabled', 'unsupported', 'timeout', 'unavailable', 'worker_unavailable', 'expired', 'rate_limited',
]);

export function isTerminalPhase(phase: ResolutionPhase): boolean {
  return TERMINAL.has(phase);
}

/**
 * Only a direct official Google Review URL may be stored as a card destination. This mirrors the
 * server-side allow-list (`isOfficialReviewUrl`) plus the client's original check.
 */
export function isDirectReviewUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    if (url.hostname === 'search.google.com') {
      return url.pathname === '/local/writereview' && Boolean(url.searchParams.get('placeid'));
    }
    if (url.hostname === 'g.page') return /^\/r\/[^/]+\/review\/?$/i.test(url.pathname);
  } catch {
    /* not a URL */
  }
  return false;
}

/**
 * Map a `POST /api/resolve` outcome to a phase.
 *
 * A 200 means the job was queued (never resolved synchronously). Every other status is terminal
 * for this attempt, so the caller must stop and render copy instead of polling.
 */
export function phaseForResolveResponse(status: number, body: ResolveResponseBody | null | undefined): Exclude<ResolutionPhase, 'idle'> {
  if (status === 200) return 'resolving';
  const code = body?.code ?? null;

  // Stable codes are authoritative when present, because a proxy may rewrite the status.
  if (code === 'resolver_disabled') return 'disabled';
  if (code === 'resolver_not_migrated') return 'unavailable';
  if (code === 'rate_limited' || status === 429) return 'rate_limited';
  if (code === 'unsupported_url' || status === 400) return 'unsupported';
  if (status === 503) return 'disabled';
  if (status === 404) return 'failed';
  if (status === 401 || status === 403 || status === 409) return 'failed';
  return 'failed';
}

/**
 * Decide the next phase from one status poll.
 *
 * Terminal unless it returns `resolving`; `elapsedMs` is measured from the moment the job was
 * queued (not from the current poll), and `consecutiveErrors` counts failed polls since the last
 * successful response.
 */
export function phaseForJob(
  job: JobView | null | undefined,
  ctx: { elapsedMs: number; consecutiveErrors?: number; now?: number },
): Exclude<ResolutionPhase, 'idle'> {
  if ((ctx.consecutiveErrors ?? 0) >= MAX_CONSECUTIVE_POLL_ERRORS) return 'unavailable';
  if (!job) return 'unavailable';

  switch (job.status) {
    case 'success':
      // A "success" without a usable direct review URL must never unlock activation.
      return isDirectReviewUrl(job.reviewUrl) ? 'success' : 'failed';
    case 'inconclusive':
      return 'inconclusive';
    case 'failed':
      return job.errorCode === 'timeout' ? 'timeout' : 'failed';
    case 'expired':
      return 'expired';
    case 'pending': {
      if (job.expiresAt) {
        const expiresAt = Date.parse(job.expiresAt);
        if (Number.isFinite(expiresAt) && expiresAt <= (ctx.now ?? Date.now())) return 'expired';
      }
      // The API reports `workerAvailable: false` when no worker heartbeat is fresh. After a short
      // grace window (a worker may just be starting) the user is told nothing is consuming the
      // queue instead of waiting out the full client deadline.
      if (job.workerAvailable === false && ctx.elapsedMs >= NO_WORKER_GRACE_MS) return 'worker_unavailable';
      return 'resolving';
    }
    case 'running':
      return 'resolving';
    default:
      return 'unavailable';
  }
}

/** The overall client deadline, applied independently of any single job status. */
export function phaseForDeadline(elapsedMs: number): Exclude<ResolutionPhase, 'idle'> {
  return elapsedMs >= MAX_POLL_MS ? 'timeout' : 'resolving';
}
