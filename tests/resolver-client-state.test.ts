import { describe, expect, it } from 'vitest';
import {
  MAX_CONSECUTIVE_POLL_ERRORS,
  NO_WORKER_GRACE_MS,
  isDirectReviewUrl,
  isTerminalPhase,
  phaseForDeadline,
  phaseForJob,
  phaseForResolveResponse,
} from '../src/lib/resolver/client-state';

// Regression coverage for the Vercel hotfix: every one of these states used to leave the
// activation form spinning (or waiting out the full 120 s client deadline) instead of telling the
// user what happened. See docs/NFC-HOTFIX-VERCEL-RESOLVER.md.

const PLACE_ID = 'ChIJQeGqDPodby4RQBEuhEv7Zjs';
const REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

describe('resolver disabled by the kill switch', () => {
  it('maps the 503 + machine code to a terminal "disabled" state, not a spinner', () => {
    const phase = phaseForResolveResponse(503, { code: 'resolver_disabled', error: 'Fitur resolusi otomatis belum aktif di lingkungan ini.' });
    expect(phase).toBe('disabled');
    expect(isTerminalPhase(phase)).toBe(true);
  });

  it('still treats a bare 503 (proxy default) as disabled', () => {
    expect(phaseForResolveResponse(503, null)).toBe('disabled');
    expect(phaseForResolveResponse(200, { jobToken: 'x' })).toBe('resolving');
  });

  it('reports an unmigrated database as unavailable rather than a generic failure', () => {
    expect(phaseForResolveResponse(503, { code: 'resolver_not_migrated' })).toBe('unavailable');
  });
});

describe('worker unavailable', () => {
  it('escalates a pending job with no live worker after the grace window', () => {
    const job = { status: 'pending', workerAvailable: false };
    expect(phaseForJob(job, { elapsedMs: 0 })).toBe('resolving');
    expect(phaseForJob(job, { elapsedMs: NO_WORKER_GRACE_MS - 1 })).toBe('resolving');
    expect(phaseForJob(job, { elapsedMs: NO_WORKER_GRACE_MS })).toBe('worker_unavailable');
  });

  it('keeps polling when worker liveness is unknown, and while a worker is running the job', () => {
    expect(phaseForJob({ status: 'pending', workerAvailable: null }, { elapsedMs: 60_000 })).toBe('resolving');
    expect(phaseForJob({ status: 'pending', workerAvailable: true }, { elapsedMs: 60_000 })).toBe('resolving');
    expect(phaseForJob({ status: 'running', workerAvailable: false }, { elapsedMs: 60_000 })).toBe('resolving');
  });
});

describe('expired resolution job', () => {
  it('treats an expired job as terminal', () => {
    expect(phaseForJob({ status: 'expired' }, { elapsedMs: 1000 })).toBe('expired');
    expect(isTerminalPhase('expired')).toBe(true);
  });

  it('also expires a pending job whose deadline has passed (server has not swept it yet)', () => {
    const now = Date.parse('2026-10-17T10:00:00.000Z');
    const job = { status: 'pending', workerAvailable: true, expiresAt: '2026-10-17T09:59:59.000Z' };
    expect(phaseForJob(job, { elapsedMs: 20_000, now })).toBe('expired');
    expect(phaseForJob({ ...job, expiresAt: '2026-10-17T10:15:00.000Z' }, { elapsedMs: 20_000, now })).toBe('resolving');
  });
});

describe('failed Google Maps resolution', () => {
  it('maps a failed job and its error code to explicit states', () => {
    expect(phaseForJob({ status: 'failed', errorCode: 'no_place_id' }, { elapsedMs: 9000 })).toBe('failed');
    expect(phaseForJob({ status: 'failed', errorCode: 'timeout' }, { elapsedMs: 9000 })).toBe('timeout');
    expect(phaseForJob({ status: 'inconclusive', errorCode: 'identity_mismatch' }, { elapsedMs: 9000 })).toBe('inconclusive');
    expect(phaseForJob({ status: 'failed', errorCode: 'google_blocked' }, { elapsedMs: 9000 })).toBe('failed');
  });

  it('never unlocks activation from a success that carries no direct review URL', () => {
    expect(phaseForJob({ status: 'success', reviewUrl: null }, { elapsedMs: 9000 })).toBe('failed');
    expect(phaseForJob({ status: 'success', reviewUrl: 'https://maps.app.goo.gl/HihE1JQdDmzBDCVC8' }, { elapsedMs: 9000 })).toBe('failed');
  });

  it('ends the attempt after repeated poll errors and on the global deadline', () => {
    expect(phaseForJob({ status: 'pending' }, { elapsedMs: 2000, consecutiveErrors: MAX_CONSECUTIVE_POLL_ERRORS })).toBe('unavailable');
    expect(phaseForJob({ status: 'weird' }, { elapsedMs: 2000 })).toBe('unavailable');
    expect(phaseForDeadline(119_999)).toBe('resolving');
    expect(phaseForDeadline(120_000)).toBe('timeout');
  });

  it('maps rate limiting and unsupported links without a spinner', () => {
    expect(phaseForResolveResponse(429, null)).toBe('rate_limited');
    expect(phaseForResolveResponse(400, { code: 'unsupported_url' })).toBe('unsupported');
    expect(phaseForResolveResponse(500, { code: 'resolver_error' })).toBe('failed');
  });
});

describe('successful resolution followed by card activation', () => {
  it('reaches success only with a genuine direct review URL, which is what activation submits', () => {
    const job = {
      status: 'success',
      placeId: PLACE_ID,
      reviewUrl: REVIEW_URL,
      businessName: 'Universitas Islam Negeri Siber Syekh Nurjati Cirebon (UINSSC)',
      businessAddress: 'Jl. Perjuangan, Sunyaragi, Kec. Kesambi, Kota Cirebon, Jawa Barat 45132',
      workerAvailable: true,
    };
    const phase = phaseForJob(job, { elapsedMs: 9500 });
    expect(phase).toBe('success');
    // The form only enables the activation button for `verifiedUrl`, which is set from this value,
    // and the server re-validates the same URL against the job row inside the activation transaction.
    expect(isDirectReviewUrl(job.reviewUrl)).toBe(true);
    expect(isDirectReviewUrl(REVIEW_URL)).toBe(true);
    expect(isDirectReviewUrl('https://g.page/r/repiw-e2e/review')).toBe(true);
  });
});
