import { NextRequest,NextResponse } from 'next/server';
import { activationSchema,validReviewURL } from '@/lib/validation';
import { jsonError,enforceRateLimit,sameOrigin } from '@/lib/http';
import { db,sha256,transaction } from '@/lib/db';
import { verifyActivationCode } from '@/lib/security';
export const runtime='nodejs';
export async function POST(req:NextRequest) {
  if(!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.',403);
  const limited=await enforceRateLimit(req,'activation',12,15*60_000); if(limited)return limited;
  let body:unknown;try{body=await req.json()}catch{return jsonError('Format permintaan tidak valid.',400)}
  const parsed=activationSchema.safeParse(body);if(!parsed.success)return jsonError('Data aktivasi tidak valid.',400);
  const {code,activationCode,reviewURL}=parsed.data;
  if(!validReviewURL(reviewURL))return jsonError('Gunakan tautan Google Review HTTPS yang valid.',400);
  const outcome=await transaction(async(tx)=>{
    const [card]=await tx.query<{id:number;active:number;secret_hash:string}>('SELECT id,active,secret_hash FROM cards WHERE code=? FOR UPDATE',[code]);
    if(!card)return 'missing' as const;if(card.active)return 'active' as const;
    if(!verifyActivationCode(activationCode,card.secret_hash))return 'secret' as const;
    const result=await tx.execute('UPDATE cards SET active=1,review_url=?,activated_at=CURRENT_TIMESTAMP,secret_hash=? WHERE id=? AND active=0',[reviewURL,`consumed:${sha256(activationCode)}`,card.id]);
    return result.affectedRows===1?'ok' as const:'active' as const;
  });
  if(outcome==='missing')return jsonError('Kartu tidak ditemukan.',404);
  if(outcome==='active')return jsonError('Kartu sudah aktif.',409);
  if(outcome==='secret')return jsonError('Kode aktivasi salah.',401);
  return NextResponse.json({ok:true});
}
