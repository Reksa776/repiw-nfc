'use client';
import { useState } from 'react';

type Card = { code: string; nfc_registered_at: string | null };
export function NfcProgrammer({ cards, onComplete, language }: { cards: Card[]; onComplete: () => Promise<void>; language: 'id' | 'en' }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const id = language === 'id';
  async function program() {
    setBusy(true); setMessage(''); setError(false);
    try {
      if (!('NDEFReader' in window)) throw new Error(id ? 'Browser ini tidak mendukung NFC Web. Gunakan Chrome di Android dengan NFC aktif dan HTTPS.' : 'Web NFC is unavailable. Use Chrome on Android with NFC enabled over HTTPS.');
      if (!code) throw new Error(id ? 'Pilih ID kartu terlebih dahulu.' : 'Select a card ID first.');
      const prep = await fetch('/api/admin/nfc/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const prepBody = await prep.json();
      if (!prep.ok) throw new Error(prepBody.error || 'Could not prepare NFC card.');
      const reader = new NDEFReader();
      await reader.write({ records: [{ recordType: 'url', data: prepBody.url }] });
      const saved = await fetch('/api/admin/nfc/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, programmed: true, url: prepBody.url }) });
      const savedBody = await saved.json();
      if (!saved.ok) throw new Error(savedBody.error || 'Could not save NFC registration.');
      await onComplete();
      setMessage(id ? `Kartu ${code} berhasil diprogram dan dicatat. Tempelkan lagi ke ponsel untuk mencoba.` : `Card ${code} is programmed and registered. Tap it again to verify.`);
    } catch (e) { setError(true); setMessage(e instanceof Error ? e.message : (id ? 'Pemrograman NFC gagal.' : 'NFC programming failed.')); }
    finally { setBusy(false); }
  }
  return <section className="panel nfc-programmer">
    <p className="eyebrow">NFC</p><h2>{id ? 'Program kartu NFC' : 'Program an NFC card'}</h2>
    <p className="muted">{id ? 'Pilih kartu yang sudah dibuat, lalu tempel tag NFC kosong ke ponsel Android. URL unik kartu akan ditulis dan statusnya disimpan di database.' : 'Select a generated card, then tap a blank NFC tag to your Android phone. The card URL is written and its registration is saved to the database.'}</p>
    <div className="nfc-controls"><label>{id ? 'ID kartu' : 'Card ID'}<select value={code} onChange={e => setCode(e.target.value)}><option value="">{id ? 'Pilih kartu…' : 'Choose a card…'}</option>{cards.map(card => <option key={card.code} value={card.code}>{card.code}{card.nfc_registered_at ? (id ? ' · sudah terdaftar' : ' · registered') : ''}</option>)}</select></label><button type="button" className="button" disabled={busy || !cards.length} onClick={program}>{busy ? (id ? 'Tempelkan kartu…' : 'Hold card near phone…') : (id ? 'Tulis & daftarkan NFC' : 'Write & register NFC')}</button></div>
    {message && <p className={error ? 'error nfc-message' : 'success nfc-message'} role="status">{message}</p>}
    <p className="fine-print">{id ? 'Membutuhkan Chrome Android, perangkat NFC aktif, HTTPS, dan tag NFC NDEF yang dapat ditulis. Browser tidak mengungkap UID/nomor seri fisik tag.' : 'Requires Android Chrome, NFC enabled, HTTPS, and a writable NDEF tag. Browsers do not expose the physical NFC tag UID/serial.'}</p>
  </section>;
}
