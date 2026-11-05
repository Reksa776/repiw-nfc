import { NextResponse } from 'next/server';
import { requireAdmin,jsonError } from '@/lib/http';
import { listCards } from '@/lib/cards';
import { ensureDriveSchema } from '@/lib/google-drive';
export const runtime='nodejs',dynamic='force-dynamic';
export async function GET() { if(!await requireAdmin()) return jsonError('Silakan login admin.',401); try { await ensureDriveSchema(); return NextResponse.json(await listCards(),{headers:{'Cache-Control':'no-store'}}); } catch(error) { console.error('Could not prepare Drive file schema for card list',error); return jsonError('Data kartu tidak dapat dimuat. Jalankan migrasi database terbaru.',500); } }
