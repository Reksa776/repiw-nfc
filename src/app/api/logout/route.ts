import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import { jsonError, sameOrigin } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.',403);
  await destroySession(); return NextResponse.json({ok:true});
}
