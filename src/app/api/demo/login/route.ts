import { NextRequest,NextResponse } from 'next/server';
import { demo } from '@/lib/db';import { createSession, ensureDemoAdminId } from '@/lib/auth';import { jsonError,sameOrigin,enforceRateLimit } from '@/lib/http';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return jsonError('Permintaan lintas situs ditolak.',403);
 if(!demo)return jsonError('Mode demo tidak aktif.',404);
 const limited=await enforceRateLimit(req,'demo-login',10,15*60_000);if(limited)return limited;
 await createSession(await ensureDemoAdminId());return NextResponse.json({ok:true,demo:true});
}
