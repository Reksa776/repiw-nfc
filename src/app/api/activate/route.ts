import { NextRequest,NextResponse } from 'next/server';
import { activationSchema,validDestinationURL,validReviewURL } from '@/lib/validation';
import { jsonError,enforceRateLimit,sameOrigin } from '@/lib/http';
import { db,sha256,transaction } from '@/lib/db';
import { verifyActivationCode } from '@/lib/security';
import { buildReviewUrl } from '@/lib/resolver/extract';
import { verifyConfirmationToken } from '@/lib/resolver/http-places';
export const runtime='nodejs';
const GOOGLE_HOSTS=new Set(['g.page','google.com','www.google.com','maps.google.com','maps.app.goo.gl','search.google.com']);
function linkKind(value:string):'review'|'maps-place'|'maps-short'|'google-other'{
  const u=new URL(value);
  if(u.hostname==='search.google.com'&&u.pathname==='/local/writereview'&&u.searchParams.has('placeid'))return 'review';
  if(u.hostname==='g.page'&&/\/review\/?$/i.test(u.pathname))return 'review';
  if(u.hostname==='maps.app.goo.gl')return 'maps-short';
  if(u.hostname==='g.page'||u.hostname==='maps.google.com'||u.pathname.startsWith('/maps/'))return 'maps-place';
  return 'google-other';
}
export async function GET(req:NextRequest){
  if(!sameOrigin(req))return jsonError('Permintaan lintas situs ditolak.',403);
  if(req.nextUrl.searchParams.has('businessSearch'))return jsonError('Gunakan endpoint resolver IDs Only.',410);
  const limited=await enforceRateLimit(req,'review-link-inspect',20,15*60_000);if(limited)return limited;
  const raw=req.nextUrl.searchParams.get('inspectURL');
  if(!raw||raw.length>2048||!validReviewURL(raw))return jsonError('Masukkan tautan Google HTTPS yang valid.',400);
  const initial=new URL(raw);
  if(initial.port&&initial.port!=='443')return jsonError('Tautan harus memakai port HTTPS standar.',400);
  let current=initial,resolved=false;
  try{
    for(let hop=0;hop<6;hop++){
      const response=await fetch(current,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(3500),headers:{'User-Agent':'REPIW-Link-Inspector/1.0','Range':'bytes=0-0'}});
      if(response.status<300||response.status>=400){await response.body?.cancel();break;}
      const location=response.headers.get('location');if(!location){await response.body?.cancel();break;}
      const next=new URL(location,current);
      await response.body?.cancel();
      if(next.protocol!=='https:'||next.username||next.password||(next.port&&next.port!=='443')||!GOOGLE_HOSTS.has(next.hostname))break;
      current=next;resolved=true;
    }
  }catch{/* Google may block automated requests; the UI reports that resolution was inconclusive. */}
  return NextResponse.json({ok:true,kind:linkKind(current.href),finalURL:current.href,resolved},{headers:{'Cache-Control':'no-store'}});
}

export async function POST(req:NextRequest) {
  if(!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.',403);
  const limited=await enforceRateLimit(req,'activation',12,15*60_000); if(limited)return limited;
  let body:unknown;try{body=await req.json()}catch{return jsonError('Format permintaan tidak valid.',400)}
  const parsed=activationSchema.safeParse(body);if(!parsed.success)return jsonError('Data aktivasi tidak valid.',400);
  const {code,activationCode,reviewURL,resolverConfirmationToken}=parsed.data;
  if(!validDestinationURL(reviewURL))return jsonError('Masukkan link tujuan HTTP atau HTTPS yang valid.',400);

  // Manual activation accepts any safe web destination. When a resolver confirmation token is
  // present, require that its generated Google review URL matches the submitted destination.
  let finalReviewUrl = reviewURL;
  let provenance: { placeId: string | null; method: string; sourceUrl: string | null; businessName: string | null; businessAddress: string | null } = {
    placeId: null, method: 'manual', sourceUrl: null, businessName: null, businessAddress: null,
  };

  if (resolverConfirmationToken) {
    const confirmation = verifyConfirmationToken(resolverConfirmationToken, code);
    if (!confirmation) return jsonError('Konfirmasi bisnis tidak valid atau sudah kedaluwarsa. Cari bisnis kembali.', 409);
    finalReviewUrl = buildReviewUrl(confirmation.placeId);
    if (reviewURL !== finalReviewUrl) return jsonError('Tautan tidak cocok dengan hasil pencarian Google Places.', 400);
    provenance = { placeId: confirmation.placeId, method: 'google-places-ids-only', sourceUrl: confirmation.sourceUrl, businessName: confirmation.query, businessAddress: null };
  }

  const outcome=await transaction(async(tx)=>{
    const [card]=await tx.query<{id:number;active:number;secret_hash:string}>('SELECT id,active,secret_hash FROM cards WHERE code=? FOR UPDATE',[code]);
    if(!card)return 'missing' as const;if(card.active)return 'active' as const;
    if(!verifyActivationCode(activationCode,card.secret_hash))return 'secret' as const;
    const result=await tx.execute(
      `UPDATE cards SET active=1,review_url=?,activated_at=CURRENT_TIMESTAMP,secret_hash=?,activation_code_encrypted=NULL,
        place_id=?,source_url=?,resolution_status='verified',resolution_method=?,resolved_at=CURRENT_TIMESTAMP,resolved_business_name=?,resolved_business_address=?
       WHERE id=? AND active=0`,
      [finalReviewUrl,`consumed:${sha256(activationCode)}`,provenance.placeId,provenance.sourceUrl,provenance.method,provenance.businessName,provenance.businessAddress,card.id]);
    return result.affectedRows===1?'ok' as const:'active' as const;
  });
  if(outcome==='missing')return jsonError('Kartu tidak ditemukan.',404);
  if(outcome==='active')return jsonError('Kartu sudah aktif.',409);
  if(outcome==='secret')return jsonError('Kode aktivasi salah.',401);
  return NextResponse.json({ok:true,reviewURL:finalReviewUrl});
}
