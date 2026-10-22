'use client';

import { useEffect, useState } from 'react';
import { localizedMessage, useLanguage } from '@/lib/i18n';
import {
  REQUEST_TIMEOUT_MS,
  isDirectReviewUrl,
  type ResolutionPhase,
} from '@/lib/resolver/client-state';

// `verified` is the editor's own success state: the destination is ready to preview.
type Phase = ResolutionPhase | 'verified';
type Candidate = { placeId: string; reviewURL: string; mapsURL: string; confirmationToken: string };
type Preview = { oldUrl: string | null; newUrl: string; placeId: string | null; method: string; businessName: string | null; businessAddress: string | null };
type CardDestination = { code: string; active: number; review_url: string | null; place_id: string | null; source_url: string | null; resolution_status: string | null; resolution_method: string | null; resolved_business_name: string | null; resolved_business_address: string | null };

const RETRY_PHASES: Phase[] = ['inconclusive', 'failed', 'timeout', 'unavailable', 'rate_limited'];
const FALLBACK_PHASES: Phase[] = ['disabled', 'unavailable', 'rate_limited'];

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
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [resolvedUrl, setResolvedUrl] = useState('');
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [businessAddress, setBusinessAddress] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

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
    setPhase('idle'); setConfirmationToken(null); setCandidates([]); setResolvedUrl(''); setBusinessName(null); setBusinessAddress(null); setPreview(null); setMessage('');
  }

  function cancelResolution() {
    setPhase('idle'); setMessage('');
  }

  async function resolve() {
    const value = input.trim();
    setMessage(''); setPreview(null);
    if (!value) return;
    if (isDirectReviewUrl(value)) {
      // A direct review link needs no server resolution; it still goes through the same preview.
      setResolvedUrl(value); setConfirmationToken(null); setPhase('verified');
      await requestPreview({ reviewURL: value });
      return;
    }
    setPhase('resolving'); setBusy(true);
    try {
      const res = await fetch('/api/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: value, cardCode: code }), signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      const body = await res.json().catch(() => ({})) as { error?: string; candidates?: Candidate[]; query?: string };
      if (!res.ok) { setPhase(res.status === 503 ? 'disabled' : res.status === 429 ? 'rate_limited' : 'failed'); setMessage(body.error || t('resolverFailed')); return; }
      setCandidates(body.candidates ?? []); setBusinessName(body.query ?? null); setPhase((body.candidates?.length ?? 0) ? 'success' : 'inconclusive');
      if (!body.candidates?.length) setMessage(id ? 'Google Places tidak menemukan kandidat.' : 'Google Places returned no candidates.');
    } catch (error) { setPhase('unavailable'); setMessage(error instanceof Error ? error.message : t('resolverUnavailable')); }
    finally { setBusy(false); }
  }

  async function requestPreview(body: { reviewURL?: string; resolverConfirmationToken?: string }): Promise<boolean> {
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
        body: JSON.stringify(confirmationToken ? { resolverConfirmationToken: confirmationToken, confirm: true } : { reviewURL: preview.newUrl, confirm: true }),
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
    success: id ? 'Kandidat Place ID ditemukan; periksa bisnis di Maps di bawah.' : 'Place ID candidates found; verify the business in Maps below.',
    inconclusive: t('resolverInconclusive'),
    failed: t('resolverFailed'),
    disabled: t('resolverDisabled'),
    unsupported: t('resolverUnsupported'),
    timeout: t('resolverTimeout'),
    unavailable: t('resolverUnavailable'),
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
    {candidates.length > 0 && <div className="form-stack"><p className="field-hint">{id ? 'Hasil berisi Place ID saja. Buka tiap kandidat di Maps untuk memeriksa nama dan alamat; Places API IDs Only tidak memberikan nama bisnis.' : 'Results contain Place IDs only. Open each candidate in Maps to verify its name and address; Places API IDs Only does not return business names.'}</p>{candidates.map((candidate) => <div className="panel" key={candidate.placeId}><p><b>Place ID:</b> <code>{candidate.placeId}</code></p><a href={candidate.mapsURL} target="_blank" rel="noreferrer">{id ? 'Buka kandidat di Google Maps ↗' : 'Open candidate in Google Maps ↗'}</a><button type="button" className="button button-outline" disabled={busy} onClick={async () => { setConfirmationToken(candidate.confirmationToken); setResolvedUrl(candidate.reviewURL); setPhase('verified'); await requestPreview({ resolverConfirmationToken: candidate.confirmationToken }); }}>{id ? 'Ini bisnis yang benar' : 'This is the correct business'}</button></div>)}</div>}
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
