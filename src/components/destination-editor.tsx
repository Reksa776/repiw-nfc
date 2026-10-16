'use client';

import { useEffect, useState } from 'react';
import { localizedMessage, useLanguage } from '@/lib/i18n';

type Phase = 'idle' | 'resolving' | 'verified' | 'inconclusive' | 'failed' | 'disabled' | 'unsupported' | 'timeout' | 'unavailable';
type JobResponse = { status?: string; placeId?: string | null; reviewUrl?: string | null; businessName?: string | null; businessAddress?: string | null; errorCode?: string | null };
type Preview = { oldUrl: string | null; newUrl: string; placeId: string | null; method: string; businessName: string | null; businessAddress: string | null };
type CardDestination = { code: string; active: number; review_url: string | null; place_id: string | null; source_url: string | null; resolution_status: string | null; resolution_method: string | null; resolved_business_name: string | null; resolved_business_address: string | null };

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 120000;

/** Mirrors the server-side allow-list: only a direct Google review destination may be stored. */
function looksOfficialReview(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password) return false;
    if (u.hostname === 'search.google.com') return u.pathname === '/local/writereview' && Boolean(u.searchParams.get('placeid'));
    if (u.hostname === 'g.page') return /^\/r\/[^/]+\/review\/?$/i.test(u.pathname);
  } catch { /* not a URL */ }
  return false;
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

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/cards/${code}/destination`, { cache: 'no-store' })
      .then(async (res) => (res.ok ? ((await res.json()).card as CardDestination) : null))
      .then((card) => { if (active && card) setCurrent(card); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [code]);

  const currentUrl = current?.review_url ?? null;

  function resetVerification() {
    setPhase('idle'); setJobToken(null); setResolvedUrl(''); setBusinessName(null); setBusinessAddress(null); setPreview(null); setMessage('');
  }

  async function resolve() {
    const value = input.trim();
    setMessage(''); setPreview(null);
    if (!value) return;
    if (looksOfficialReview(value)) {
      // A direct review link needs no server resolution; it still goes through the same preview.
      setResolvedUrl(value); setJobToken(null); setPhase('verified');
      await requestPreview({ reviewURL: value });
      return;
    }
    setPhase('resolving'); setBusy(true);
    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value, cardCode: code }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 503) { setPhase('disabled'); return; }
      if (res.status === 400) { setPhase('unsupported'); return; }
      if (!res.ok) { setPhase('failed'); setMessage(localizedMessage(body.error || t('resolverFailed'), language)); return; }
      await poll(body.jobToken as string);
    } catch (err) {
      setPhase('unavailable');
      setMessage(err instanceof Error ? localizedMessage(err.message, language) : t('unexpectedError'));
    } finally { setBusy(false); }
  }

  async function poll(token: string) {
    const deadline = Date.now() + MAX_POLL_MS;
    while (Date.now() < deadline) {
      await new Promise((done) => window.setTimeout(done, POLL_INTERVAL_MS));
      let job: JobResponse;
      try {
        const res = await fetch(`/api/resolve/${encodeURIComponent(token)}`, { cache: 'no-store' });
        if (!res.ok) { setPhase('unavailable'); return; }
        job = await res.json();
      } catch { setPhase('unavailable'); return; }

      if (job.status === 'success' && job.reviewUrl) {
        setJobToken(token); setResolvedUrl(job.reviewUrl); setBusinessName(job.businessName ?? null); setBusinessAddress(job.businessAddress ?? null); setPhase('verified');
        await requestPreview({ resolutionJobToken: token });
        return;
      }
      if (job.status === 'inconclusive') { setPhase('inconclusive'); return; }
      if (job.status === 'failed' || job.status === 'expired') { setPhase(job.errorCode === 'timeout' ? 'timeout' : 'failed'); return; }
    }
    setPhase('timeout');
  }

  async function requestPreview(body: { reviewURL?: string; resolutionJobToken?: string }): Promise<boolean> {
    setBusy(true); setMessage('');
    try {
      const res = await fetch(`/api/admin/cards/${code}/destination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
    resolving: t('resolvingLink'),
    verified: t('verifiedReady'),
    inconclusive: t('resolverInconclusive'),
    failed: t('resolverFailed'),
    disabled: t('resolverDisabled'),
    unsupported: t('resolverUnsupported'),
    timeout: t('resolverTimeout'),
    unavailable: t('resolverUnavailable'),
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
      {(phase === 'inconclusive' || phase === 'failed' || phase === 'timeout' || phase === 'unavailable') && <button type="button" className="button button-outline" onClick={() => { void resolve(); }}>{t('retryResolution')}</button>}
    </div>}
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
