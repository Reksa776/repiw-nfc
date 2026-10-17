'use client';

import { FormEvent, useRef, useState } from 'react';
import { LanguageSwitcher, localizedMessage, useLanguage } from '@/lib/i18n';
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

type Inspection = { kind: 'review' | 'maps-place' | 'maps-short' | 'google-other'; finalURL: string; resolved: boolean };
type BusinessResult = { id: string; name: string; address: string; reviewURL: string };
type ResolvePhase = Exclude<ResolutionPhase, 'idle'>;
type Resolution = { token: string; phase: ResolvePhase; placeId?: string | null; reviewUrl?: string | null; businessName?: string | null; businessAddress?: string | null };
type JobResponse = JobView;

const TERMINAL_FAILURES: ResolvePhase[] = ['inconclusive', 'failed', 'timeout', 'unavailable', 'worker_unavailable', 'expired', 'rate_limited'];
const MANUAL_FALLBACK_PHASES: ResolvePhase[] = ['disabled', 'unavailable', 'worker_unavailable', 'expired', 'rate_limited'];

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function ActivationForm({ code, source }: { code: string; source: string }) {
  const { language, t } = useLanguage();
  const id = language === 'id';
  const [busy, setBusy] = useState(false), [writing, setWriting] = useState(false), [inspectBusy, setInspectBusy] = useState(false);
  const [error, setError] = useState(''), [done, setDone] = useState(false), [reviewTarget, setReviewTarget] = useState(''), [writeMessage, setWriteMessage] = useState('');
  const [reviewInput, setReviewInput] = useState(''), [inspection, setInspection] = useState<Inspection | null>(null), [inspectError, setInspectError] = useState('');
  const [businesses, setBusinesses] = useState<BusinessResult[]>([]);
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [verifiedUrl, setVerifiedUrl] = useState(''), [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  // Identifies the current resolution attempt. Bumping it (start/retry/cancel) makes every older,
  // still-running poll loop exit, so no stale loop can ever overwrite the state again.
  const runRef = useRef(0);

  function resetVerification() {
    runRef.current += 1;
    setInspection(null); setInspectError(''); setBusinesses([]); setResolution(null); setVerifiedUrl(''); setVerifiedToken(null);
  }

  function cancelResolution() {
    runRef.current += 1;
    setResolution(null); setInspectBusy(false); setInspectError('');
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!verifiedUrl) { setError(id ? 'Selesaikan tautan Google Review dulu.' : 'Resolve a Google Review link first.'); return; }
    setBusy(true); setError('');
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, activationCode: data.get('activationCode'), reviewURL: verifiedUrl, resolutionJobToken: verifiedToken || undefined }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(localizedMessage(body.error || t('activationFailed'), language));
      if (typeof body.reviewURL !== 'string' || !body.reviewURL.startsWith('https://')) throw new Error(id ? 'Tautan Google Review tidak valid.' : 'The Google Review URL is invalid.');
      setReviewTarget(body.reviewURL); setDone(true);
    } catch (err) { setError(err instanceof Error ? localizedMessage(err.message, language) : t('unexpectedError')); }
    finally { setBusy(false); }
  }

  async function searchBusiness(value: string) {
    // Bounded like every other request in this flow: a stalled Places lookup must not leave the
    // button in "Memproses…" forever.
    const res = await fetch(`/api/activate?businessSearch=${encodeURIComponent(value)}`, { cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || (id ? 'Bisnis tidak bisa dicari.' : 'Could not search for this business.'));
    setBusinesses(body.places as BusinessResult[]); setResolution(null);
  }

  function acceptOfficial(value: string) {
    setInspection({ kind: 'review', finalURL: value, resolved: true });
    setVerifiedUrl(value); setVerifiedToken(null); setResolution(null); setBusinesses([]);
  }

  async function inspectLink() {
    const value = reviewInput.trim();
    setInspectBusy(true); setInspectError(''); setInspection(null); setBusinesses([]); setResolution(null); setVerifiedUrl(''); setVerifiedToken(null);
    try {
      if (!/^https?:\/\//i.test(value)) { await searchBusiness(value); return; }
      if (isDirectReviewUrl(value)) { acceptOfficial(value); return; }
      await startResolution(value);
    } catch (err) {
      const timedOut = err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError');
      setInspectError(timedOut ? t('resolverTimeout') : err instanceof Error ? localizedMessage(err.message, language) : t('unexpectedError'));
    }
    finally { setInspectBusy(false); }
  }

  async function startResolution(url: string) {
    const run = ++runRef.current;
    const activationCode = (document.querySelector('input[name=activationCode]') as HTMLInputElement | null)?.value || '';

    let res: Response;
    let body: { code?: string; error?: string; jobToken?: string; workerAvailable?: boolean | null } | null;
    try {
      res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, code, activationCode }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      body = await res.json().catch(() => null);
    } catch {
      if (run === runRef.current) setResolution({ token: '', phase: 'unavailable' });
      return;
    }
    if (run !== runRef.current) return;

    // Every non-200 outcome is terminal: disabled, unsupported, rate limited, not migrated,
    // failed. The user gets copy plus the manual-activation fallback instead of a spinner.
    const phase = phaseForResolveResponse(res.status, body);
    if (phase !== 'resolving') {
      setResolution({ token: '', phase });
      if (body?.error && phase !== 'disabled' && phase !== 'rate_limited') setInspectError(localizedMessage(body.error, language));
      return;
    }
    if (!body?.jobToken) { setResolution({ token: '', phase: 'unavailable' }); return; }

    const startedAt = Date.now();
    setResolution({ token: body.jobToken, phase: 'resolving' });
    await pollResolution(body.jobToken, startedAt, run, body.workerAvailable ?? null);
  }

  async function pollResolution(token: string, startedAt: number, run: number, workerAvailable: boolean | null) {
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
        if (!res.ok) {
          // A hard server error (e.g. the resolution tables are missing) is terminal, not a reason
          // to keep polling for two minutes.
          setResolution({ token, phase: res.status === 503 ? 'unavailable' : 'failed' });
          return;
        }
        job = await res.json();
      } catch {
        // A single timed-out or dropped poll is retried; three in a row end the attempt.
        consecutiveErrors += 1;
        if (run !== runRef.current) return;
        if (consecutiveErrors >= 3) { setResolution({ token, phase: 'unavailable' }); return; }
        continue;
      }
      consecutiveErrors = 0;

      const phase = phaseForJob(
        { ...job, workerAvailable: job.workerAvailable ?? workerAvailable },
        { elapsedMs: Date.now() - startedAt, consecutiveErrors },
      );
      if (phase === 'resolving') continue;
      if (run !== runRef.current) return;
      if (phase === 'success') {
        setResolution({ token, phase, placeId: job.placeId, reviewUrl: job.reviewUrl, businessName: job.businessName, businessAddress: job.businessAddress });
      } else {
        setResolution({ token, phase });
      }
      return;
    }
    if (run === runRef.current) setResolution({ token, phase: 'timeout' });
  }

  function confirmResolved() {
    if (!resolution?.reviewUrl || !isDirectReviewUrl(resolution.reviewUrl)) return;
    setVerifiedUrl(resolution.reviewUrl); setVerifiedToken(resolution.token);
    setReviewInput(resolution.reviewUrl);
  }

  async function writeDirectLink() {
    if (!reviewTarget) return; setWriting(true); setWriteMessage('');
    try {
      if (!('NDEFReader' in window)) { setWriteMessage(id ? 'Browser ini tidak mendukung penulisan NFC. Salin tautan di bawah dan tulis sebagai record URL memakai aplikasi penulis NFC.' : 'This browser cannot write NFC. Copy the link below and write it as a URL record with an NFC writer app.'); return; }
      const writer = new NDEFReader(); await writer.write({ records: [{ recordType: 'url', data: reviewTarget }] }, { overwrite: true });
      setWriteMessage(id ? 'Tag NFC berhasil diubah. Tap berikutnya akan membuka Google Review langsung.' : 'NFC tag updated. The next tap will open Google Review directly.'); window.location.assign(reviewTarget);
    } catch (err) { setWriteMessage(`${id ? 'Gagal menulis tag. Pastikan NFC aktif, gunakan HTTPS dan tag masih bisa ditulis.' : 'Could not write the tag. Make sure NFC is enabled, use HTTPS, and the tag is writable.'} ${err instanceof Error ? err.message : ''}`); }
    finally { setWriting(false); }
  }
  async function copyReviewLink() {
    try { await navigator.clipboard.writeText(reviewTarget); setWriteMessage(id ? 'Link disalin. Tempelkan sebagai record URL di aplikasi NFC writer.' : 'Link copied. Paste it as a URL record in an NFC writer app.'); }
    catch { setWriteMessage(id ? 'Gagal menyalin. Tekan lama link lalu pilih Salin.' : 'Copy failed. Long-press the link and choose Copy.'); }
  }

  const resolutionMessage: Record<ResolvePhase, string> = {
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

  const resultText = inspection && (inspection.kind === 'review'
    ? (id ? 'Tautan ini tampak menuju formulir penulisan ulasan Google.' : 'This appears to be a Google review-writing link.')
    : inspection.kind === 'maps-place'
      ? (id ? 'Tautan ini tampak menuju lokasi atau profil di Google Maps. Belum tentu langsung ke formulir ulasan.' : 'This appears to lead to a Google Maps place or profile, not necessarily the review form.')
      : inspection.kind === 'maps-short'
        ? (id ? 'Ini tautan pendek Google Maps. Tujuan akhirnya belum berhasil dibaca oleh server.' : 'This is a Google Maps short link. The server could not confirm its final destination.')
        : (id ? 'Tautan Google terdeteksi, tetapi format formulir ulasan tidak dikenali.' : 'A Google link was detected, but its review-form format was not recognized.'));
  const success = t('cardActivated').replace('{code}', code);
  const isUrl = /^https?:\/\//i.test(reviewInput.trim());

  return <main className="activation-shell"><div className="auth-language"><LanguageSwitcher /></div><div className="activation-card"><div className="brand-mark">R</div><p className="eyebrow">{t('cardLabel')} · {source.toUpperCase()}</p><h1>{t('activateCard')}</h1><p className="muted">{t('activationInstructions')}</p>
    {done ? <><div className="success" role="status">{success}</div><p className="muted activation-review-note">{id ? (source === 'qr' ? 'Aktivasi lewat QR berhasil. Siapkan kartu NFC, tekan tombol di bawah, lalu tempelkan kartu ke bagian NFC ponsel dan tahan sampai selesai. Link Google Review akan ditulis ke chip.' : 'Tekan tombol di bawah, lalu tempelkan kartu NFC ke bagian NFC ponsel dan tahan sampai link Google Review selesai ditulis ke chip.') : (source === 'qr' ? 'QR activation is complete. Get the NFC card ready, press the button below, then hold the card near the phone NFC area until writing finishes. The Google Review link will be saved to the chip.' : 'Press the button below, then hold the NFC card near the phone until the Google Review link has been written to the chip.')}</p><button type="button" className="button" disabled={writing} onClick={writeDirectLink}>{writing ? (id ? 'Menulis NFC…' : 'Writing NFC…') : (id ? 'Tulis link Google Review ke chip NFC' : 'Write Google Review link to NFC chip')}</button>{writeMessage && <p className="success" role="status">{writeMessage}</p>}<label className="field-hint">{id ? 'Link tujuan Google Review' : 'Google Review destination'}<input readOnly value={reviewTarget} onFocus={e => e.currentTarget.select()} /></label><button type="button" className="button button-outline" onClick={copyReviewLink}>{id ? 'Salin link untuk NFC writer' : 'Copy link for NFC writer'}</button><a className="button activation-review-link" href={reviewTarget}>{id ? 'Buka Google Review' : 'Open Google Review'} ↗</a><p className="fine-print">{id ? 'Di iPhone/Safari, Web NFC tidak tersedia: salin link lalu tulis ke tag memakai aplikasi NFC writer. Tag yang sudah ditulis ulang akan melewati REPIW; tap langsung ke Google dan tidak tercatat di analytics REPIW.' : 'On iPhone/Safari, Web NFC is unavailable: copy the URL and write it with an NFC writer app. A rewritten tag bypasses REPIW, opens Google directly, and will not be counted in REPIW analytics.'}</p></>
      : <form onSubmit={submit} className="form-stack"><label>{t('cardId')}<input value={code} readOnly /></label><label>{id ? 'Kode aktivasi / sandi kartu' : t('activationCodeLabel')}<input name="activationCode" autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} inputMode="text" minLength={4} maxLength={12} required placeholder={t('codePlaceholder')} /><small className="field-hint">{id ? 'Kode aktivasi baru terdiri dari 4 karakter dan ada di kartu atau CSV dashboard. Kode lama 12 karakter tetap bisa digunakan.' : 'New activation codes have 4 characters and come with the card or dashboard CSV. Previously issued 12-character codes still work.'}</small></label><label>{t('googleReviewUrl')}<input name="reviewURL" type="text" autoComplete="url" required placeholder={id ? 'Tempel link ulasan/Maps atau ketik nama bisnis' : 'Paste a review/Maps link or type a business name'} value={reviewInput} onChange={e => { setReviewInput(e.target.value); resetVerification(); setError(''); }} /><small className="field-hint">{t('pasteOrResolve')}</small></label><button type="button" className="button button-outline" onClick={inspectLink} disabled={inspectBusy || reviewInput.trim().length < 2}>{inspectBusy ? (id ? 'Memproses…' : 'Working…') : (isUrl ? t('resolveMapsLink') : (id ? 'Cari bisnis & buat link ulasan' : 'Find business & generate review link'))}</button>
      {businesses.length > 0 && <div className="form-stack" role="list" aria-label={id ? 'Hasil bisnis Google' : 'Google business results'}>{businesses.map(place => <button type="button" className="button button-outline" key={place.id} onClick={() => { setReviewInput(place.reviewURL); acceptOfficial(place.reviewURL); }}><strong>{place.name}</strong>{place.address && <small className="field-hint">{place.address}</small>}</button>)}</div>}
      {resolution && <div className={resolution.phase === 'success' ? 'success' : 'field-hint'} role="status"><strong>{resolutionMessage[resolution.phase]}</strong>
        {resolution.phase === 'resolving' && <button type="button" className="button button-outline" onClick={cancelResolution}>{t('resolverCancel')}</button>}
        {resolution.phase === 'success' && <>
          {resolution.businessName && <p>{t('resolvedBusiness')}: <b>{resolution.businessName}</b>{resolution.businessAddress ? <> — {resolution.businessAddress}</> : null}</p>}
          {resolution.reviewUrl && <p>{t('resolvedReviewLink')}: <a href={resolution.reviewUrl} target="_blank" rel="noreferrer">{resolution.reviewUrl}</a></p>}
          {verifiedUrl ? <p className="success" role="status">{t('verifiedReady')}</p> : <button type="button" className="button" onClick={confirmResolved}>{t('confirmLocation')}</button>}
        </>}
        {TERMINAL_FAILURES.includes(resolution.phase) && <button type="button" className="button button-outline" onClick={() => { void inspectLink(); }}>{t('retryResolution')}</button>}
        {MANUAL_FALLBACK_PHASES.includes(resolution.phase) && <p className="field-hint">{t('resolverManualFallback')}</p>}
      </div>}
      {inspection && <div className="success" role="status"><strong>{resultText}</strong>{inspection.kind === 'review' && <p>{t('officialReviewDetected')} <a href={inspection.finalURL} target="_blank" rel="noreferrer">{inspection.finalURL}</a></p>}<small>{id ? 'HP akan membuka aplikasi atau browser berdasarkan link dan pengaturan perangkat.' : 'Your phone opens the app or browser based on the link and device settings.'}</small><button type="button" className="button button-outline" onClick={resetVerification}>{t('changeLink')}</button></div>}
      {inspectError && <p className="error" role="alert">{localizedMessage(inspectError, language)}</p>}{error && <p className="error">{error}</p>}
      <button disabled={busy || !verifiedUrl}>{busy ? t('activating') : t('activate')}</button></form>}
    <p className="fine-print">{t('httpsHint')}</p></div></main>;
}
