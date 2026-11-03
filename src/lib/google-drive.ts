import 'server-only';
import crypto from 'node:crypto';
import { db } from '@/lib/db';

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

async function nextDrivePdfNumber(token: string, folderId: string) {
  let pageToken: string | undefined;
  let highest = 0;
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
      const match = /^(\d+)(?:\.pdf)?$/i.exec(file.name || '');
      if (match) highest = Math.max(highest, Number(match[1]));
    }
    pageToken = body.nextPageToken;
  } while (pageToken);
  if (!Number.isSafeInteger(highest + 1)) throw new Error('Google Drive PDF numbering exceeded the supported range.');
  return highest + 1;
}

/** Reserve a contiguous set of PDF names. The Drive scan recovers the number
 * after manual edits, while the database counter prevents concurrent batches
 * on different server instances from reserving the same numbers. */
export async function reserveCardPdfNumbers(count: number) {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('PDF number reservation count is invalid.');
  const token = await accessToken();
  const folderId = await resolveFolderId(token);
  const firstAvailable = await nextDrivePdfNumber(token, folderId);
  const rows = await db.query<{ first_number: string | number }>(
    `INSERT INTO drive_file_counters(counter_name,next_value) VALUES('card_pdfs',?::bigint + ?::bigint)
     ON CONFLICT(counter_name) DO UPDATE
     SET next_value=GREATEST(drive_file_counters.next_value,EXCLUDED.next_value-?::bigint)+?::bigint
     RETURNING (next_value-?::bigint) AS first_number`,
    [firstAvailable, count, count, count, count],
  );
  const first = Number(rows[0]?.first_number);
  if (!Number.isSafeInteger(first) || first < 1 || !Number.isSafeInteger(first + count - 1)) throw new Error('Could not reserve valid Google Drive PDF numbers.');
  return Array.from({ length: count }, (_, index) => first + index);
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

export const uploadCardPdf = (number: number, pdf: Buffer) => {
  if (!Number.isSafeInteger(number) || number < 1) throw new Error('Google Drive PDF number is invalid.');
  return uploadCardFile(String(number), pdf, 'application/pdf', null);
};
