import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { authenticateAdmin, createSession } from '@/lib/auth';
import { enforceRateLimit, jsonError, sameOrigin } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.', 403);
  const limited = await enforceRateLimit(req, 'login', 8, 15*60_000); if (limited) return limited;
  let body: unknown; try { body = await req.json(); } catch { return jsonError('Format permintaan tidak valid.', 400); }
  const parsed = loginSchema.safeParse(body); if (!parsed.success) return jsonError('Username dan password wajib diisi.', 400);
  const admin = await authenticateAdmin(parsed.data.username, parsed.data.password);
  if (!admin) return jsonError('Username atau password salah.', 401);
  await createSession(admin.id);
  return NextResponse.json({ok:true}, {headers:{'Cache-Control':'no-store'}});
}
