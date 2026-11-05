import 'server-only';
import crypto from 'node:crypto';
import { db, transaction } from '@/lib/db';

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };
let cachedToken: { value: string; expiresAt: number } | undefined;
let cachedFolderId: string | undefined;

export function googleDriveConfigured() {
  const hasServiceAccount = Boolean(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON?.trim());
  const hasUserOAuth = Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID?.trim() && process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim() && process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim());
  return Boolean(hasUserOAuth || (hasServiceAccount && process.env.GOOGLE_DRIVE_FOLDER_ID?.trim()));
}

function serviceAccount(): ServiceAccount {
  const raw = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) throw new Error('GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON is not configured.');
  const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
  if (!parsed.client_email || !parsed.private_key) throw new Error('Google service account JSON is missing client_email or private_key.');
  return { client_email: parsed.client_email, private_key: parsed.private_key, token_uri: parsed.token_uri };
}

const encode = (value: string | Buffer) => Buffer.from(value).toString('base64url');

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim();
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim();
  if (refreshToken && clientId && clientSecret) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret }),
      signal: AbortSignal.timeout(12_000),
    });
    const body = await response.json() as { access_token?: string; expires_in?: number; error_description?: string };
    if (!response.ok || !body.access_token) throw new Error(`Google OAuth refresh failed: ${body.error_description || response.status}`);
    cachedToken = { value: body.access_token, expiresAt: Date.now() + Number(body.expires_in || 3600) * 1000 };
    return cachedToken.value;
  }
  const account = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = encode(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: account.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(account.private_key).toString('base64url')}`;
  const tokenResponse = await fetch(account.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    signal: AbortSignal.timeout(12_000),
  });
  const tokenBody = await tokenResponse.json() as { access_token?: string; expires_in?: number; error_description?: string };
  if (!tokenResponse.ok || !tokenBody.access_token) throw new Error(`Google OAuth failed: ${tokenBody.error_description || tokenResponse.status}`);
  cachedToken = { value: tokenBody.access_token, expiresAt: Date.now() + Number(tokenBody.expires_in || 3600) * 1000 };
  return cachedToken.value;
}

async function resolveFolderId(token: string) {
  const configured = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (configured) return configured;
  if (cachedFolderId) return cachedFolderId;
  if (!process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim()) throw new Error('Service-account uploads require GOOGLE_DRIVE_FOLDER_ID for a Shared Drive folder.');
  const query = new URLSearchParams({
    q: "name='REPIW QR' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: 'files(id,name)',
    pageSize: '1',
  });
  const found = await fetch(`https://www.googleapis.com/drive/v3/files?${query}`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(12_000),
  });
  const foundBody = await found.json() as { files?: Array<{ id: string }>; error?: { message?: string; errors?: Array<{ reason?: string }> } };
  if (!found.ok) throw new Error(`Google Drive folder lookup failed (${found.status}): ${foundBody.error?.errors?.[0]?.reason || foundBody.error?.message || 'Unknown API error'}`);
  if (foundBody.files?.[0]) return cachedFolderId = foundBody.files[0].id;
  const created = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'REPIW QR', mimeType: 'application/vnd.google-apps.folder' }),
    signal: AbortSignal.timeout(12_000),
  });
  const createdBody = await created.json() as { id?: string; error?: { message?: string; errors?: Array<{ reason?: string }> } };
  if (!created.ok || !createdBody.id) throw new Error(`Google Drive folder creation failed (${created.status}): ${createdBody.error?.errors?.[0]?.reason || createdBody.error?.message || 'Unknown API error'}`);
  return cachedFolderId = createdBody.id;
}

async function existingDriveFileNumbers(token: string, folderId: string) {
  let pageToken: string | undefined;
  const numbers = new Set<number>();
  do {
    const query = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken,files(name)',
      pageSize: '1000',
      includeItemsFromAllDrives: 'true',
      supportsAllDrives: 'true',
    });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(12_000),
    });
    const body = await response.json() as { files?: Array<{ name?: string }>; nextPageToken?: string; error?: { message?: string; errors?: Array<{ reason?: string }> } };
    if (!response.ok) throw new Error(`Google Drive file lookup failed (${response.status}): ${body.error?.errors?.[0]?.reason || body.error?.message || 'Unknown API error'}`);
    for (const file of body.files || []) {
      const match = /^(\d+)(?:\.(?:pdf|png))?$/i.exec(file.name || '');
      if (match) {
        const number = Number(match[1]);
        if (Number.isSafeInteger(number) && number > 0) numbers.add(number);
      }
    }
    pageToken = body.nextPageToken;
  } while (pageToken);
  return numbers;
}

/** Reserve the lowest unused Drive image numbers. A database lock serializes reservations
 * across server instances, and pending rows protect numbers before upload finishes. */
export async function reserveCardImageNumbers(count: number) {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('Drive image number reservation count is invalid.');
  const token = await accessToken();
  const folderId = await resolveFolderId(token);
  const driveScanStartedAt = new Date();
  const driveNumbers = await existingDriveFileNumbers(token, folderId);
  return transaction(async tx => {
    await tx.execute(`INSERT INTO drive_file_counters(counter_name,next_value) VALUES('card_pdfs',1) ON CONFLICT(counter_name) DO NOTHING`);
    await tx.query('SELECT next_value FROM drive_file_counters WHERE counter_name=? FOR UPDATE', ['card_pdfs']);
    // Reconcile older completed uploads against this Drive snapshot. The time
    // boundary protects reservations made after the scan began from a stale scan.
    await tx.execute(
      `DELETE FROM drive_file_reservations
       WHERE (status='uploaded' AND updated_at < ? AND NOT (number=ANY(?::bigint[])))
          OR (status='pending' AND updated_at < CURRENT_TIMESTAMP - INTERVAL '2 minutes')`,
      [driveScanStartedAt, [...driveNumbers]],
    );
    const reservedRows = await tx.query<{ number: string | number }>('SELECT number FROM drive_file_reservations');
    const unavailable = new Set([...driveNumbers, ...reservedRows.map(row => Number(row.number))]);
    const numbers: number[] = [];
    let candidate = 1;
    while (numbers.length < count) {
      if (!Number.isSafeInteger(candidate)) throw new Error('Google Drive image numbering exceeded the supported range.');
      if (!unavailable.has(candidate)) {
        numbers.push(candidate);
        unavailable.add(candidate);
      }
      candidate++;
    }
    for (const number of numbers) await tx.execute('INSERT INTO drive_file_reservations(number,status) VALUES(? ,\'pending\')', [number]);
    return numbers;
  });
}

export async function refreshCardImageReservations(numbers: number[]) {
  if (!numbers.length) return;
  await db.execute("UPDATE drive_file_reservations SET updated_at=CURRENT_TIMESTAMP WHERE status='pending' AND number=ANY(?::bigint[])", [numbers]);
}

async function uploadCardFile(name: string, content: Buffer, mimeType: string, extension: 'png' | 'pdf' | null) {
  const token = await accessToken();
  const folderId = await resolveFolderId(token);
  const metadata = { name: extension ? `${name}.${extension}` : name, mimeType, parents: [folderId] };
  const boundary = `repiw_${crypto.randomBytes(12).toString('hex')}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    content,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const upload = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink&supportsAllDrives=true', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}`, 'Content-Length': String(body.byteLength) },
    body, signal: AbortSignal.timeout(30_000),
  });
  const result = await upload.json() as { id?: string; webViewLink?: string; error?: { message?: string; errors?: Array<{ reason?: string }> } };
  if (!upload.ok || !result.id) throw new Error(`Google Drive upload failed (${upload.status}): ${result.error?.errors?.[0]?.reason || result.error?.message || 'Unknown API error'}`);
  return { fileId: result.id, webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view` };
}

export const uploadCardQrImage = (number: number, image: Buffer) => {
  if (!Number.isSafeInteger(number) || number < 1) throw new Error('Google Drive image number is invalid.');
  return uploadCardFile(String(number), image, 'image/png', null).then(async uploaded => {
    await db.execute("UPDATE drive_file_reservations SET status='uploaded',drive_file_id=?,updated_at=CURRENT_TIMESTAMP WHERE number=?", [uploaded.fileId, number]);
    return uploaded;
  }).catch(async error => {
    await db.execute("DELETE FROM drive_file_reservations WHERE number=? AND status='pending'", [number]).catch(() => undefined);
    throw error;
  });
};
