'use client';

import { FormEvent, useState } from 'react';

export function ActivationForm({ code, source }: { code: string; source: string }) {
  const [busy, setBusy] = useState(false);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState('');
  const [writeMessage, setWriteMessage] = useState('');
  const [done, setDone] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, activationCode: data.get('activationCode'), reviewURL: data.get('reviewURL') }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Aktivasi gagal');
      if (typeof body.reviewURL !== 'string' || !['http:', 'https:'].includes(new URL(body.reviewURL).protocol)) {
        throw new Error('Link tujuan tidak valid.');
      }
      setFallbackUrl(new URL(`/c/${encodeURIComponent(code)}?src=nfc`, window.location.origin).toString());
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setBusy(false);
    }
  }

  async function writeNfc() {
    setWriteMessage('');
    setError('');
    if (!('NDEFReader' in window)) {
      setWriteMessage('Browser ini tidak mendukung penulisan NFC. Salin URL di bawah, lalu tulis sebagai record URL menggunakan aplikasi NFC Tools di Android atau iPhone.');
      return;
    }

    setWriting(true);
    try {
      const reader = new NDEFReader();
      await reader.write({ records: [{ recordType: 'url', data: fallbackUrl }] }, { overwrite: true });
      setWriteMessage('Berhasil ditulis ke kartu NFC. Tempelkan lagi kartu ke ponsel untuk menguji.');
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError') {
        setError('Izin NFC ditolak atau penulisan tidak dimulai dari tombol. Pastikan NFC aktif, izinkan akses, lalu tekan tombol ini lagi.');
      } else if (name === 'NotSupportedError') {
        setError('Tag tidak mendukung NDEF atau terkunci. Coba tag NFC kosong yang bisa ditulis.');
      } else if (name === 'AbortError') {
        setError('Penulisan dibatalkan. Tempelkan kartu ke bagian belakang ponsel dan coba lagi.');
      } else {
        setError(err instanceof Error ? `${err.message} Pastikan memakai Chrome Android melalui HTTPS dan tag mendukung NDEF.` : 'Penulisan NFC gagal. Coba lagi dengan Chrome Android dan tag NDEF yang bisa ditulis.');
      }
    } finally {
      setWriting(false);
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(fallbackUrl);
      setWriteMessage('URL NFC disalin. Buka aplikasi penulis NFC, pilih Write, lalu simpan URL sebagai record URL.');
      setError('');
    } catch {
      setError('URL tidak dapat disalin otomatis. Pilih URL di kotak, salin, lalu tulis dengan aplikasi NFC.');
    }
  }

  return <main className="activation-shell"><div className="activation-card">
    <div className="brand-mark">R</div>
    <p className="eyebrow">KARTU REPIW · {source.toUpperCase()}</p>
    {done ? <>
      <h1>Kartu berhasil diaktifkan</h1>
      <p className="muted">Sekarang tulis URL REPIW ke chip NFC. Setelah itu, tap kartu akan tercatat dan membuka link tujuan yang tadi Anda masukkan.</p>
      <button type="button" className="nfc-write-button" onClick={writeNfc} disabled={writing}>
        {writing ? 'Menunggu kartu… tempelkan ke ponsel' : 'Tulis link ke kartu NFC'}
      </button>
      {writeMessage && <p className="success nfc-message" role="status">{writeMessage}</p>}
      <label className="nfc-fallback-label">URL NFC kartu<input readOnly value={fallbackUrl} onFocus={e => e.currentTarget.select()} /></label>
      <button type="button" className="button button-outline nfc-copy-button" onClick={copyUrl}>Salin URL untuk aplikasi NFC</button>
      <p className="fine-print">Penulisan langsung memerlukan Chrome Android, HTTPS, NFC aktif, dan tag NDEF yang bisa ditulis. iPhone dan browser yang tidak mendukung Web NFC dapat menggunakan aplikasi penulis NFC native.</p>
    </> : <>
      <h1>Aktifkan kartu Anda</h1>
      <p className="muted">Masukkan kode pada kartu, lalu tempel link tujuan untuk NFC.</p>
      <form onSubmit={submit} className="form-stack">
        <label>Card ID<input value={code} readOnly /></label>
        <label>Kode aktivasi<input name="activationCode" autoComplete="one-time-code" autoCapitalize="characters" minLength={4} maxLength={12} pattern="(?:[A-HJ-NP-Z2-9]{4}|[A-Fa-f0-9]{12})" required placeholder="4 karakter (kode lama: 12)" /></label>
        <label>Link tujuan NFC<input name="reviewURL" type="url" required placeholder="https://contoh.com" /></label>
        <p className="fine-print">Tempel link situs atau layanan apa pun. Gunakan alamat HTTP atau HTTPS yang ingin dibuka saat kartu NFC dipindai.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={busy}>{busy ? 'Mengaktifkan…' : 'Aktifkan kartu'}</button>
      </form>
    </>}
    {done && error && <p className="error" role="alert">{error}</p>}
  </div></main>;
}
