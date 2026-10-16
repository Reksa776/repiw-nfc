# REPIW V1 — Panduan pemula

Aplikasi pengelolaan **kartu Google Review berbasis NFC + QR Code**.
Stack: Node.js · Express · SQLite · HTML/CSS/JavaScript (tanpa framework frontend).

> Status: **berjalan & teruji** — 38 pengujian backend + 28 pengujian browser (Otomatis) lulus.

---

## 1. Persyaratan

- **Node.js ≥ 22.5** (disarankan Node 24). Cek: `node --version`.
- npm (menyertai Node).
- Tidak perlu compiler C++ / Python. SQLite memakai modul bawaan Node (`node:sqlite`),
  jadi `npm install` ringan dan **tidak gagal walau nama folder mengandung tanda kurung**.

## 2. Instalasi

1. Buka terminal di folder project ini.
2. `npm install`
3. `cp .env.example .env` (Windows: `Copy-Item .env.example .env`)
4. Isi `ADMIN_PASSWORD` dan `SESSION_SECRET` dengan nilai acak panjang dan **berbeda**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. `npm start`
6. Buka http://localhost:3000

File `.env` bawaan sudah disiapkan untuk **demo lokal** (`ADMIN_PASSWORD=repiw-demo`, `DEMO_MODE=true`).
Ganti sebelum dipakai sungguhan.

## 3. URL lokal

| Halaman | URL |
| --- | --- |
| Landing | http://localhost:3000/ |
| **Dashboard Admin** | http://localhost:3000/admin |
| **Flow Preview** | http://localhost:3000/flow-preview (alias `/demo`) |
| Halaman Review (simulasi) | http://localhost:3000/demo-review?card=RP-DEMO&src=qr |
| Kartu / scan | http://localhost:3000/c/&lt;CardID&gt;?src=qr atau `?src=nfc` |

## 4. Login demo

- URL: http://localhost:3000/admin · Password: **`repiw-demo`**
- Di **Flow Preview**, klik *“Masuk sebagai admin demo”* (login otomatis, hanya saat `DEMO_MODE=true`).

## 5. Mode DEMO & pemisahan data (penting)

`DEMO_MODE=true` di `.env` akan:

- Memakai **database terpisah** `data/repiw-demo.sqlite` (produksi memakai `data/repiw.sqlite`),
  sehingga data demo **tidak pernah bercampur** dengan data produksi.
- Mengaktifkan login admin demo & tombol **Isi data demo / Reset data demo**.
- Mengalihkan kartu aktif ke halaman `/demo-review` (simulasi Google Review), bukan Google asli.

Tidak perlu domain, hosting, kartu fisik, chip NFC, atau akun Google.

**Produksi:** `DEMO_MODE=false`, gunakan `BASE_URL` HTTPS final, dan jangan ubah BASE_URL
setelah QR/NFC dicetak.

## 6. Data demo (seed & reset)

Tersedia di **Flow Preview → Perjalanan Admin → Data Demo** dan di **Admin → Settings → Data Demo**
(hanya muncul saat `DEMO_MODE=true`).

- **Isi data demo realistis** — 16 kartu (10 aktif + 6 nonaktif), URL review bervariasi,
  tanggal dibuat/aktivasi acak dalam ~45 hari terakhir, dan ratusan kunjungan QR/NFC.
- **Reset data demo** — hanya menghapus baris `demo=1`; baris non-demo tidak tersentuh.

Endpoint (khusus demo, butuh login admin): `POST /api/demo/seed`, `POST /api/demo/reset`, `GET /api/demo/data`.

## 7. Flow Preview (perjalanan dipisah)

`/flow-preview` punya 5 tab yang menjalankan alur **asli** (endpoint & database sama):

1. **Perjalanan Admin** — login → dashboard → Generate Cards → Card ID unik → Activation Code →
   URL QR & NFC → Download QR (PNG/ZIP) → kelola status → Data Demo.
2. **Perjalanan Pembeli** — terima kartu → Scan QR / Tap NFC → cek status → halaman aktivasi →
   isi Activation Code + URL → status ACTIVE.
3. **Perjalanan Pelanggan** — pilih kartu aktif → Scan QR / NFC → kunjungan tercatat → redirect review.
4. **Analytics** — Total/Activated/Inactive/NFC/QR/Total Kunjungan.
5. **Error Handling** — uji 401 (kode salah), 404 (kartu tak ada), 409 (sudah aktif), 400 (URL invalid).

Setiap tab menampilkan layar browser (iframe) berisi halaman asli dari server.

## 8. Menguji manual

1. `npm start` → buka `/flow-preview`.
2. Tab **Admin** → *Isi data demo* (atau Generate Cards).
3. Tab **Pembeli** → pilih kartu INACTIVE → **Simulasikan QR Scan** → kode terisi otomatis → **Aktifkan**.
4. Tab **Pelanggan** → pilih kartu ACTIVE → **Simulasikan QR/NFC** → lihat redirect review.
5. Tab **Analytics** → angka NFC/QR/Activated berubah.
6. Tab **Error Handling** → klik tiap tombol, lihat kode HTTP.

## 9. Pengujian otomatis

### Backend (Test A–G) — `npm test`
Menjalankan server di port & database sementara: 38 pemeriksaan.
A Generate Card · B Scan belum aktif · C Aktivasi · D Scan aktif · E Dashboard update ·
F Error handling · G Seed & Reset data demo · plus semua halaman 200.

### Browser / Visual QA — `npm run qa`
Memakai **Google Chrome** (headless) via `puppeteer-core`:
menguji login, sidebar, generate, seed, tab Flow Preview, aktivasi, scan, analytics,
error handling, dan **responsif desktop + mobile** (deteksi overflow horizontal).
Screenshot disimpan ke `qa-screenshots/`.

Persiapan: `puppeteer-core` sudah termasuk **devDependencies**, jadi `npm install` sudah cukup.
Butuh **Google Chrome** terpasang di sistem. Bila Chrome/puppeteer tidak ada,
uji manual sesuai bagian 8. (`puppeteer-core` hanya alat uji, tidak dipakai saat produksi.)

---

## 10. Cara kerja & persiapan cetak

- QR `RP-XXXXX` berisi `BASE_URL/c/RP-XXXXX?src=qr`.
- Tulis `BASE_URL/c/RP-XXXXX?src=nfc` ke chip NTAG213 (record URL/URI).
- Cocokkan Card ID pada CSV, QR PNG, dan chip sebelum mencetak.
- Kode aktivasi diberikan privat (di kemasan tertutup, bukan di muka kartu).
- Belum aktif → tap/scan membuka form aktivasi. Aktif → redirect ke Google Review.
- Gunakan QR PNG dari ZIP, jangan screenshot. Cetak ≥ 25–30 mm, sisakan quiet zone, uji beberapa HP.

## 11. Sebelum publik (produksi)

Tambahkan HTTPS + reverse proxy, backup berkala `data/repiw.sqlite`, monitoring, dan
perlindungan brute-force terpusat. Jangan ubah `BASE_URL` setelah kartu dicetak.
Kode aktivasi yang hilang tidak bisa dipulihkan (perlu proses reset terverifikasi).
Jangan menjanjikan review bintang lima atau memberi imbalan untuk review positif.
