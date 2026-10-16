'use client';

import { FormEvent, useState } from 'react';
import { LanguageSwitcher, localizedMessage, useLanguage } from '@/lib/i18n';

type Inspection = { kind: 'review' | 'maps-place' | 'maps-short' | 'google-other'; finalURL: string; resolved: boolean };
type BusinessResult = { id: string; name: string; address: string; reviewURL: string };
type ResolverPhase = 'resolving' | 'success' | 'inconclusive' | 'failed' | 'disabled' | 'unsupported' | 'timeout' | 'unavailable';
type Resolution = { token: string; phase: ResolverPhase; placeId?: string | null; reviewUrl?: string | null; businessName?: string | null; businessAddress?: string | null };
type JobResponse = { status?: string; placeId?: string | null; reviewUrl?: string | null; businessName?: string | null; businessAddress?: string | null; errorCode?: string | null };

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 120000;

function looksOfficialReview(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password) return false;
    if (u.hostname === 'search.google.com') return u.pathname === '/local/writereview' && Boolean(u.searchParams.get('placeid'));
    if (u.hostname === 'g.page') return /^\/r\/[^/]+\/review\/?$/i.test(u.pathname);
  } catch { /* not a URL */ }
  return false;
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

  function resetVerification() {
    setInspection(null); setInspectError(''); setBusinesses([]); setResolution(null); setVerifiedUrl(''); setVerifiedToken(null);
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
    const res = await fetch(`/api/activate?businessSearch=${encodeURIComponent(value)}`, { cache: 'no-store' });
    const body = await res.json();
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
      if (looksOfficialReview(value)) { acceptOfficial(value); return; }
      await startResolution(value);
    } catch (err) { setInspectError(err instanceof Error ? localizedMessage(err.message, language) : t('unexpectedError')); }
    finally { setInspectBusy(false); }
  }

  async function startResolution(url: string) {
    const activationCode = (document.querySelector('input[name=activationCode]') as HTMLInputElement | null)?.value || '';
    const res = await fetch('/api/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, code, activationCode }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 503) { setResolution({ token: '', phase: 'disabled' }); return; }
    if (res.status === 400) { setResolution({ token: '', phase: 'unsupported' }); return; }
    if (!res.ok) { setResolution({ token: '', phase: 'failed' }); setInspectError(localizedMessage(body.error || t('resolverFailed'), language)); return; }
    setResolution({ token: body.jobToken, phase: 'resolving' });
    await pollResolution(body.jobToken);
  }

  async function pollResolution(token: string) {
    const deadline = Date.now() + MAX_POLL_MS;
    while (Date.now() < deadline) {
      await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
      let job: JobResponse;
      try {
        const res = await fetch(`/api/resolve/${encodeURIComponent(token)}`, { cache: 'no-store' });
        if (!res.ok) { setResolution({ token, phase: 'unavailable' }); return; }
        job = await res.json();
      } catch { setResolution({ token, phase: 'unavailable' }); return; }

      if (job.status === 'success') {
        setResolution({ token, phase: 'success', placeId: job.placeId, reviewUrl: job.reviewUrl, businessName: job.businessName, businessAddress: job.businessAddress });
        return;
      }
      if (job.status === 'inconclusive') { setResolution({ token, phase: 'inconclusive' }); return; }
      if (job.status === 'failed' || job.status === 'expired') { setResolution({ token, phase: job.errorCode === 'timeout' ? 'timeout' : 'failed' }); return; }
      // otherwise keep polling (pending / running)
    }
    setResolution({ token, phase: 'timeout' });
  }

  function confirmResolved() {
    if (!resolution?.reviewUrl) return;
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

  const resolutionMessage: Record<ResolverPhase, string> = {
    resolving: t('resolvingLink'),
    success: t('verifiedReady'),
    inconclusive: t('resolverInconclusive'),
    failed: t('resolverFailed'),
    disabled: t('resolverDisabled'),
    unsupported: t('resolverUnsupported'),
    timeout: t('resolverTimeout'),
    unavailable: t('resolverUnavailable'),
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
        {resolution.phase === 'success' && <>
          {resolution.businessName && <p>{t('resolvedBusiness')}: <b>{resolution.businessName}</b>{resolution.businessAddress ? <> — {resolution.businessAddress}</> : null}</p>}
          {resolution.reviewUrl && <p>{t('resolvedReviewLink')}: <a href={resolution.reviewUrl} target="_blank" rel="noreferrer">{resolution.reviewUrl}</a></p>}
          {verifiedUrl ? <p className="success" role="status">{t('verifiedReady')}</p> : <button type="button" className="button" onClick={confirmResolved}>{t('confirmLocation')}</button>}
        </>}
        {(resolution.phase === 'inconclusive' || resolution.phase === 'failed' || resolution.phase === 'timeout' || resolution.phase === 'unavailable') && <button type="button" className="button button-outline" onClick={() => { void inspectLink(); }}>{t('retryResolution')}</button>}
      </div>}
      {inspection && <div className="success" role="status"><strong>{resultText}</strong>{inspection.kind === 'review' && <p>{t('officialReviewDetected')} <a href={inspection.finalURL} target="_blank" rel="noreferrer">{inspection.finalURL}</a></p>}<small>{id ? 'HP akan membuka aplikasi atau browser berdasarkan link dan pengaturan perangkat.' : 'Your phone opens the app or browser based on the link and device settings.'}</small><button type="button" className="button button-outline" onClick={resetVerification}>{t('changeLink')}</button></div>}
      {inspectError && <p className="error" role="alert">{localizedMessage(inspectError, language)}</p>}{error && <p className="error">{error}</p>}
      <button disabled={busy || !verifiedUrl}>{busy ? t('activating') : t('activate')}</button></form>}
    <p className="fine-print">{t('httpsHint')}</p></div></main>;
}
