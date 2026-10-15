'use client';

import { FormEvent, useState } from 'react';
import { LanguageSwitcher, localizedMessage, useLanguage } from '@/lib/i18n';

type Inspection = { kind: 'review' | 'maps-place' | 'maps-short' | 'google-other'; finalURL: string; resolved: boolean };

export function ActivationForm({ code, source }: { code: string; source: string }) {
  const { language, t } = useLanguage();
  const id = language === 'id';
  const [busy, setBusy] = useState(false), [writing, setWriting] = useState(false), [inspectBusy, setInspectBusy] = useState(false);
  const [error, setError] = useState(''), [done, setDone] = useState(false), [reviewTarget, setReviewTarget] = useState(''), [writeMessage, setWriteMessage] = useState('');
  const [reviewInput, setReviewInput] = useState(''), [inspection, setInspection] = useState<Inspection | null>(null), [inspectError, setInspectError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, activationCode: data.get('activationCode'), reviewURL: data.get('reviewURL') }) });
      const body = await res.json();
      if (!res.ok) throw new Error(localizedMessage(body.error || t('activationFailed'), language));
      if (typeof body.reviewURL !== 'string' || !body.reviewURL.startsWith('https://')) throw new Error(id ? 'Tautan Google Review tidak valid.' : 'The Google Review URL is invalid.');
      setReviewTarget(body.reviewURL); setDone(true);
    } catch (err) { setError(err instanceof Error ? localizedMessage(err.message, language) : t('unexpectedError')); }
    finally { setBusy(false); }
  }

  async function inspectLink() {
    setInspectBusy(true); setInspectError(''); setInspection(null);
    try {
      const res = await fetch(`/api/activate?inspectURL=${encodeURIComponent(reviewInput)}`, { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || (id ? 'Tautan tidak bisa dianalisis.' : 'Could not analyze this link.'));
      setInspection(body as Inspection);
    } catch (err) { setInspectError(err instanceof Error ? localizedMessage(err.message, language) : t('unexpectedError')); }
    finally { setInspectBusy(false); }
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

  const resultText = inspection && (inspection.kind === 'review'
    ? (id ? 'Tautan ini tampak menuju formulir penulisan ulasan Google.' : 'This appears to be a Google review-writing link.')
    : inspection.kind === 'maps-place'
      ? (id ? 'Tautan ini tampak menuju lokasi atau profil di Google Maps. Belum tentu langsung ke formulir ulasan.' : 'This appears to lead to a Google Maps place or profile, not necessarily the review form.')
      : inspection.kind === 'maps-short'
        ? (id ? 'Ini tautan pendek Google Maps. Tujuan akhirnya belum berhasil dibaca oleh server.' : 'This is a Google Maps short link. The server could not confirm its final destination.')
        : (id ? 'Tautan Google terdeteksi, tetapi format formulir ulasan tidak dikenali.' : 'A Google link was detected, but its review-form format was not recognized.'));
  const success = t('cardActivated').replace('{code}', code);

  return <main className="activation-shell"><div className="auth-language"><LanguageSwitcher /></div><div className="activation-card"><div className="brand-mark">R</div><p className="eyebrow">{t('cardLabel')} · {source.toUpperCase()}</p><h1>{t('activateCard')}</h1><p className="muted">{t('activationInstructions')}</p>
    {done ? <><div className="success" role="status">{success}</div><p className="muted activation-review-note">{id ? (source === 'qr' ? 'Aktivasi lewat QR berhasil. Siapkan kartu NFC, tekan tombol di bawah, lalu tempelkan kartu ke bagian NFC ponsel dan tahan sampai selesai. Link Google Review akan ditulis ke chip.' : 'Tekan tombol di bawah, lalu tempelkan kartu NFC ke bagian NFC ponsel dan tahan sampai link Google Review selesai ditulis ke chip.') : (source === 'qr' ? 'QR activation is complete. Get the NFC card ready, press the button below, then hold the card near the phone NFC area until writing finishes. The Google Review link will be saved to the chip.' : 'Press the button below, then hold the NFC card near the phone until the Google Review link has been written to the chip.')}</p><button type="button" className="button" disabled={writing} onClick={writeDirectLink}>{writing ? (id ? 'Menulis NFC…' : 'Writing NFC…') : (id ? 'Tulis link Google Review ke chip NFC' : 'Write Google Review link to NFC chip')}</button>{writeMessage && <p className="success" role="status">{writeMessage}</p>}<label className="field-hint">{id ? 'Link tujuan Google Review' : 'Google Review destination'}<input readOnly value={reviewTarget} onFocus={e => e.currentTarget.select()} /></label><button type="button" className="button button-outline" onClick={copyReviewLink}>{id ? 'Salin link untuk NFC writer' : 'Copy link for NFC writer'}</button><a className="button activation-review-link" href={reviewTarget}>{id ? 'Buka Google Review' : 'Open Google Review'} ↗</a><p className="fine-print">{id ? 'Di iPhone/Safari, Web NFC tidak tersedia: salin link lalu tulis ke tag memakai aplikasi NFC writer. Tag yang sudah ditulis ulang akan melewati REPIW; tap langsung ke Google dan tidak tercatat di analytics REPIW.' : 'On iPhone/Safari, Web NFC is unavailable: copy the URL and write it with an NFC writer app. A rewritten tag bypasses REPIW, opens Google directly, and will not be counted in REPIW analytics.'}</p></>
      : <form onSubmit={submit} className="form-stack"><label>{t('cardId')}<input value={code} readOnly /></label><label>{id ? 'Kode aktivasi / sandi kartu' : t('activationCodeLabel')}<input name="activationCode" autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} inputMode="text" minLength={4} maxLength={12} required placeholder={t('codePlaceholder')} /><small className="field-hint">{id ? 'Kode aktivasi baru terdiri dari 4 karakter dan ada di kartu atau CSV dashboard. Kode lama 12 karakter tetap bisa digunakan.' : 'New activation codes have 4 characters and come with the card or dashboard CSV. Previously issued 12-character codes still work.'}</small></label><label>{t('googleReviewUrl')}<input name="reviewURL" type="url" required placeholder={t('reviewPlaceholder')} value={reviewInput} onChange={e => { setReviewInput(e.target.value); setInspection(null); setInspectError(''); }} /><small className="field-hint">{id ? 'Masukkan link Google Review milik usaha, lalu kartu akan diarahkan ke link ini.' : 'Enter the business Google Review link; the card will open this link.'}</small></label><button type="button" className="button button-outline" onClick={inspectLink} disabled={inspectBusy || !reviewInput}>{inspectBusy ? (id ? 'Memeriksa tautan…' : 'Checking link…') : (id ? 'Analisis link Google' : 'Analyze Google link')}</button>{inspection && <div className="success" role="status"><strong>{resultText}</strong>{inspection.resolved && <p>{id ? 'Tujuan yang ditemukan:' : 'Resolved destination:'} <a href={inspection.finalURL} target="_blank" rel="noreferrer">{inspection.finalURL}</a></p>}<small>{id ? 'Analisis ini tidak dapat mengetahui apakah Google Maps terpasang. HP akan memilih aplikasi atau browser berdasarkan pengaturan perangkat.' : 'This cannot detect whether Google Maps is installed. Your phone chooses the app or browser based on device settings.'}</small></div>}{inspectError && <p className="error" role="alert">{inspectError}</p>}{error && <p className="error">{error}</p>}<button disabled={busy}>{busy ? t('activating') : t('activate')}</button></form>}
    <p className="fine-print">{t('httpsHint')}</p></div></main>;
}
