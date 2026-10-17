'use client';

import { useEffect, useRef, useState } from 'react';
import { localizedMessage, useLanguage } from '@/lib/i18n';
import {
  MAX_POLL_MS,
  POLL_INTERVAL_MS,
  POLL_REQUEST_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
  isDirectReviewUrl,
  phaseForJob,
  phaseForResolveResponse,
  type JobView,
  type ResolutionPhase,
} from '@/lib/resolver/client-state';

// `verified` is the editor's own success state: the destination is ready to preview.
type Phase = ResolutionPhase | 'verified';
type JobResponse = JobView;
type Preview = { oldUrl: string | null; newUrl: string; placeId: string | null; method: string; businessName: string | null; businessAddress: string | null };
type CardDestination = { code: string; active: number; review_url: string | null; place_id: string | null; source_url: string | null; resolution_status: string | null; resolution_method: string | null; resolved_business_name: string | null; resolved_business_address: string | null };

const RETRY_PHASES: Phase[] = ['inconclusive', 'failed', 'timeout', 'unavailable', 'worker_unavailable', 'expired', 'rate_limited'];
const FALLBACK_PHASES: Phase[] = ['disabled', 'unavailable', 'worker_unavailable', 'expired', 'rate_limited'];

function sleep(ms: number) {
  return new Promise((done) => window.setTimeout(done, ms));
}

/**
 * Re-point an already-activated card at a verified Google Review destination without deleting the
 * card, changing its public code, resetting activation, or losing visit analytics. Nothing is
 * written until the administrator confirms the preview of the old and new URL.
 */
export function DestinationEditor({ code, onSaved, onClose }: { code: string; onSaved: (message: string) => void; onClose: () => void }) {
  const { language, t } = useLanguage();
  const id = language === 'id';
  const [current, setCurrent] = useState<CardDestination | null>(null);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [jobToken, setJobToken] = useState<string | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState('');
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [businessAddress, setBusinessAddress] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const runRef = useRef(0);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/cards/${code}/destination`, { cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
      .then(async (res) => (res.ok ? ((await res.json()).card as CardDestination) : null))
      .then((card) => { if (active && card) setCurrent(card); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [code]);

  const currentUrl = current?.review_url ?? null;

  function resetVerification() {
    runRef.current += 1;
    setPhase('idle'); setJobToken(null); setResolvedUrl(''); setBusinessName(null); setBusinessAddress(null); setPreview(null); setMessage('');
  }

  function cancelResolution() {
    runRef.current += 1;
    setPhase('idle'); setMessage('');
  }

  async function resolve() {
    const value = input.trim();
    setMessage(''); setPreview(null);
    if (!value) return;
    const run = ++runRef.current;
    if (isDirectReviewUrl(value)) {
      // A direct review link needs no server resolution; it still goes through the same preview.
      setResolvedUrl(value); setJobToken(null); setPhase('verified');
      await requestPreview({ reviewURL: value });
      return;
    }
    setPhase('resolving'); setBusy(true);
    try {
      let res: Response;
      try {
        res = await fetch('/api/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: value, cardCode: code }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch {
        if (run === runRef.current) setPhase('unavailable');
        return;
      }
      const body = await res.json().catch(() => null);
      if (run !== runRef.current) return;
      const nextPhase = phaseForResolveResponse(res.status, body);
      if (nextPhase !== 'resolving') {
        setPhase(nextPhase);
        if (body?.error && nextPhase !== 'disabled' && nextPhase !== 'rate_limited') setMessage(localizedMessage(body.error, language));
        return;
      }
      if (!body?.jobToken) { setPhase('unavailable'); return; }
      await poll(body.jobToken, Date.now(), run, body.workerAvailable ?? null);
    } finally { setBusy(false); }
  }

  async function poll(token: string, startedAt: number, run: number, workerAvailable: boolean | null) {
    let consecutiveErrors = 0;
    while (Date.now() - startedAt < MAX_POLL_MS) {
      if (run !== runRef.current) return;
      await sleep(POLL_INTERVAL_MS);
      if (run !== runRef.current) return;

      let job: JobResponse;
      try {
        const res = await fetch(`/api/resolve/${encodeURIComponent(token)}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(POLL_REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) { setPhase(res.status === 503 ? 'unavailable' : 'failed'); return; }
        job = await res.json();
      } catch {
        consecutiveErrors += 1;
        if (run !== runRef.current) return;
        if (consecutiveErrors >= 3) { setPhase('unavailable'); return; }
        continue;
      }
      consecutiveErrors = 0;

      const nextPhase = phaseForJob(
        { ...job, workerAvailable: job.workerAvailable ?? workerAvailable },
        { elapsedMs: Date.now() - startedAt, consecutiveErrors },
      );
      if (nextPhase === 'resolving') continue;
      if (run !== runRef.current) return;
      if (nextPhase === 'success') {
        setJobToken(token); setResolvedUrl(job.reviewUrl ?? ''); setBusinessName(job.businessName ?? null); setBusinessAddress(job.businessAddress ?? null); setPhase('verified');
        await requestPreview({ resolutionJobToken: token });
        return;
      }
      setPhase(nextPhase);
      return;
    }
    if (run === runRef.current) setPhase('timeout');
  }

  async function requestPreview(body: { reviewURL?: string; resolutionJobToken?: string }): Promise<boolean> {
    setBusy(true); setMessage('');
    try {
      const res = await fetch(`/api/admin/cards/${code}/destination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage(localizedMessage(data.error || t('dashboardLoadError'), language)); return false; }
      setPreview({ oldUrl: data.oldUrl ?? null, newUrl: data.newUrl, placeId: data.placeId ?? null, method: data.method, businessName: data.businessName ?? null, businessAddress: data.businessAddress ?? null });
      return true;
    } catch (err) {
      setMessage(err instanceof Error ? localizedMessage(err.message, language) : t('unexpectedError'));
      return false;
    } finally { setBusy(false); }
  }

  async function confirmSave() {
    if (!preview) return;
    setBusy(true); setMessage('');
    try {
      const res = await fetch(`/api/admin/cards/${code}/destination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobToken ? { resolutionJobToken: jobToken, confirm: true } : { reviewURL: preview.newUrl, confirm: true }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage(localizedMessage(data.error || t('dashboardLoadError'), language)); return; }
      onSaved(t('destSaved'));
    } catch (err) {
      setMessage(err instanceof Error ? localizedMessage(err.message, language) : t('unexpectedError'));
    } finally { setBusy(false); }
  }

  const phaseMessage: Record<Phase, string> = {
    idle: '',
    verified: t('verifiedReady'),
    resolving: t('resolvingLink'),
    success: t('verifiedReady'),
    inconclusive: t('resolverInconclusive'),
    failed: t('resolverFailed'),
    disabled: t('resolverDisabled'),
    unsupported: t('resolverUnsupported'),
    timeout: t('resolverTimeout'),
    unavailable: t('resolverUnavailable'),
    worker_unavailable: t('resolverWorkerUnavailable'),
    expired: t('resolverExpired'),
    rate_limited: t('resolverRateLimited'),
  };
  const canResolve = !busy && phase !== 'resolving' && input.trim().length >= 2;
  const canConfirm = Boolean(preview) && preview?.newUrl !== currentUrl;

  return <section className="panel destination-editor">
    <div className="panel-head"><div><p className="eyebrow">{t('destEditor')}</p><h2>{code}</h2></div><button className="text-link" onClick={onClose}>{t('destClose')} ×</button></div>
    <p className="muted">{t('destEditorHint')}</p>
    <p className="field-hint">{t('destCurrent')}: <code>{currentUrl || '—'}</code></p>
    {current?.resolved_business_name && <p className="fine-print">{t('resolvedBusiness')}: {current.resolved_business_name}{current.resolved_business_address ? ` — ${current.resolved_business_address}` : ''} ({current.resolution_method || 'legacy'})</p>}
    <label>{t('googleReviewUrl')}<input type="text" value={input} placeholder={id ? 'Tempel tautan Maps atau tautan ulasan Google' : 'Paste a Maps link or a Google review link'} onChange={(e) => { setInput(e.target.value); resetVerification(); }} /></label>
    <p className="fine-print">{t('destManualHint')}</p>
    <button type="button" className="button button-outline destination-resolve" disabled={!canResolve} onClick={() => { void resolve(); }}>{busy && phase === 'resolving' ? (id ? 'Memproses…' : 'Working…') : t('resolveMapsLink')}</button>
    {phase !== 'idle' && phase !== 'resolving' && <div className={phase === 'verified' ? 'success' : 'field-hint'} role="status"><strong>{phaseMessage[phase]}</strong>
      {phase === 'verified' && <>
        {businessName && <p>{t('resolvedBusiness')}: <b>{businessName}</b>{businessAddress ? <> — {businessAddress}</> : null}</p>}
        {resolvedUrl && <p>{t('resolvedReviewLink')}: <a href={resolvedUrl} target="_blank" rel="noreferrer">{resolvedUrl}</a></p>}
      </>}
      {RETRY_PHASES.includes(phase) && <button type="button" className="button button-outline" onClick={() => { void resolve(); }}>{t('retryResolution')}</button>}
      {FALLBACK_PHASES.includes(phase) && <p className="field-hint">{t('resolverManualFallback')}</p>}
    </div>}
    {phase === 'resolving' && <div className="field-hint" role="status"><strong>{t('resolvingLink')}</strong><button type="button" className="button button-outline" onClick={cancelResolution}>{t('resolverCancel')}</button></div>}
    {preview && <div className="panel destination-preview">
      <p className="eyebrow">{t('destPreview')}</p>
      <p className="field-hint">{id ? 'Tujuan lama' : 'Old destination'}: <code>{preview.oldUrl || '—'}</code></p>
      <p className="field-hint">{id ? 'Tujuan baru' : 'New destination'}: <code>{preview.newUrl}</code></p>
      {preview.placeId && <p className="field-hint">Place ID: <code>{preview.placeId}</code></p>}
      <p className="fine-print">{preview.newUrl === currentUrl ? t('destUnchanged') : t('destExplain')}</p>
      <button type="button" className="button destination-confirm" disabled={busy || !canConfirm} onClick={() => { void confirmSave(); }}>{t('destConfirm')}</button>
    </div>}
    {message && <p className="error" role="alert">{message}</p>}
  </section>;
}
