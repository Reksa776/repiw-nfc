import { NextResponse } from 'next/server';
import { requireAdmin, jsonError } from '@/lib/http';
import { stats } from '@/lib/cards';
export const runtime='nodejs', dynamic='force-dynamic';
export async function GET() { if(!await requireAdmin()) return jsonError('Silakan login admin.',401); return NextResponse.json(await stats(),{headers:{'Cache-Control':'no-store'}}); }
