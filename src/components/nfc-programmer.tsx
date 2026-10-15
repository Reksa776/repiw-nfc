'use client';
import { useState } from 'react';

type Card = { code: string; nfc_registered_at: string | null };
export function NfcProgrammer({ cards, onComplete, language }: { cards: Card[]; onComplete: () => Promise<void>; language: 'id' | 'en' }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState('');
  const id = language === 'id';
  async function program() {
    setBusy(true); setMessage(''); setError(false);
    let cancelWriteIfNeeded = () => {};
    try {
      if (!code) throw new Error(id ? 'Pilih ID kartu terlebih dahulu.' : 'Select a card ID first.');
      const targetUrl = new URL(`/c/${encodeURIComponent(code)}?src=nfc`, window.location.origin).toString();
      setFallbackUrl(targetUrl);
      if (!('NDEFReader' in window)) {
        setMessage(id ? 'Browser ini tidak menyediakan Web NFC. Salin URL ini ke aplikasi penulis NFC bawaan/native, tulis sebagai record URL, lalu ketuk tag untuk menguji. Database akan menandai kartu saat URL NFC dibuka.' : 'This browser does not expose Web NFC. Copy this URL into a native NFC writer app, write it as a URL record, then tap the tag to test it. The database marks the card when its NFC URL is opened.');
        return;
      }
      const reader = new NDEFReader();
      const writeTask = new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(() => { cleanup(); reject(new Error(id ? 'Tag belum terdeteksi. Tempelkan tag NDEF kosong ke bagian NFC ponsel, lalu coba lagi.' : 'No tag detected. Hold a blank NDEF tag near the phone NFC area and try again.')); }, 30_000);
        const cleanup = () => { window.clearTimeout(timer); reader.removeEventListener('reading', onReading); reader.removeEventListener('readingerror', onReadingError); };
        const onReading = () => { reader.write({ records: [{ recordType: 'url', data: targetUrl }] }).then(() => { cleanup(); resolve(); }, error => { cleanup(); reject(error); }); };
        const onReadingError = () => { cleanup(); reject(new Error(id ? 'Tag terdeteksi tetapi tidak dapat dibaca. Pastikan tag mendukung NDEF dan tidak terkunci.' : 'Tag detected but could not be read. Make sure it supports NDEF and is not locked.')); };
        cancelWriteIfNeeded = cleanup;
        reader.addEventListener('reading', onReading, { once: true });
        reader.addEventListener('readingerror', onReadingError, { once: true });
      });
      await reader.scan();
      setMessage(id ? 'NFC siap. Tempelkan tag kosong ke bagian belakang ponsel…' : 'NFC is ready. Hold a blank tag near the back of your phone…');
      await writeTask;
      await onComplete();
      setFallbackUrl('');
      setMessage(id ? `Kartu ${code} berhasil diprogram. Tempelkan lagi ke ponsel untuk menguji URL dan menyelesaikan pendaftaran.` : `Card ${code} is programmed. Tap it again to verify the URL and complete registration.`);
    } catch (e) { cancelWriteIfNeeded(); setError(true); setMessage(e instanceof Error ? `${e.message}${id ? ' URL cadangan tersedia di bawah.' : ' A fallback URL is available below.'}` : (id ? 'Pemrograman NFC gagal.' : 'NFC programming failed.')); }
    finally { setBusy(false); }
  }
  async function copyUrl() {
    try { await navigator.clipboard.writeText(fallbackUrl); setMessage(id ? 'URL NFC disalin. Tempelkan ke aplikasi penulis NFC.' : 'NFC URL copied. Paste it into your NFC writer app.'); setError(false); }
    catch { setError(true); setMessage(id ? 'Gagal menyalin otomatis. Tekan lama URL lalu pilih Salin.' : 'Could not copy automatically. Long-press the URL and choose Copy.'); }
  }
  return <section className="panel nfc-programmer">
    <p className="eyebrow">NFC</p><h2>{id ? 'Program kartu NFC' : 'Program an NFC card'}</h2>
    <p className="muted">{id ? 'Pilih kartu yang sudah dibuat. Browser yang mendukung Web NFC dapat menulis langsung; browser lain akan memberi URL untuk ditulis lewat aplikasi NFC native.' : 'Select a generated card. Web NFC browsers can write directly; other browsers will provide a URL to write with a native NFC app.'}</p>
    <div className="nfc-controls"><label>{id ? 'ID kartu' : 'Card ID'}<select value={code} onChange={e => { setCode(e.target.value); setFallbackUrl(''); setMessage(''); }}><option value="">{id ? 'Pilih kartu…' : 'Choose a card…'}</option>{cards.map(card => <option key={card.code} value={card.code}>{card.code}{card.nfc_registered_at ? (id ? ' · sudah terdeteksi' : ' · detected') : ''}</option>)}</select></label><button type="button" className="button" disabled={busy || !cards.length} onClick={program}>{busy ? (id ? 'Menyiapkan…' : 'Preparing…') : (id ? 'Siapkan / tulis NFC' : 'Prepare / write NFC')}</button></div>
    {fallbackUrl && <div className="nfc-url-box"><label>{id ? 'URL NFC untuk ditulis ke tag' : 'NFC URL to write to the tag'}<input readOnly value={fallbackUrl} onFocus={e => e.currentTarget.select()} /></label><button type="button" className="button button-outline" onClick={copyUrl}>{id ? 'Salin URL' : 'Copy URL'}</button></div>}
    {message && <p className={error ? 'error nfc-message' : 'success nfc-message'} role="status">{message}</p>}
    <p className="fine-print">{id ? 'Tulis URL sebagai record NDEF URL menggunakan Web NFC atau aplikasi NFC native di iOS/Android. Setelah URL tag dibuka, kartu otomatis ditandai terdeteksi. Browser tidak mengungkap UID/nomor seri tag.' : 'Write the URL as an NDEF URL record using Web NFC or a native iOS/Android NFC app. Opening the tag URL automatically marks the card as detected. Browsers do not expose tag UID/serial.'}</p>
  </section>;
}
