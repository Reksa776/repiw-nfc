import { NextRequest,NextResponse } from 'next/server';
import { activationSchema,validReviewURL } from '@/lib/validation';
import { jsonError,enforceRateLimit,sameOrigin } from '@/lib/http';
import { db,sha256,transaction } from '@/lib/db';
import { verifyActivationCode } from '@/lib/security';
import { getJobByToken } from '@/lib/resolver/jobs';
import { isOfficialReviewUrl } from '@/lib/resolver/url-policy';
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
  const businessQuery=req.nextUrl.searchParams.get('businessSearch')?.trim();
  if(businessQuery!==undefined&&businessQuery!==null){
    const limited=await enforceRateLimit(req,'google-business-search',15,15*60_000);if(limited)return limited;
    if(businessQuery.length<2||businessQuery.length>120)return jsonError('Masukkan nama bisnis minimal 2 karakter.',400);
    const apiKey=process.env.GOOGLE_MAPS_API_KEY;
    if(!apiKey)return jsonError('Pencarian bisnis Google belum dikonfigurasi. Gunakan link ulasan langsung atau atur GOOGLE_MAPS_API_KEY.',503);
    try{
      const response=await fetch('https://places.googleapis.com/v1/places:searchText',{
        method:'POST',signal:AbortSignal.timeout(7000),
        headers:{'Content-Type':'application/json','X-Goog-Api-Key':apiKey,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.googleMapsLinks.writeAReviewUri'},
        body:JSON.stringify({textQuery:businessQuery,maxResultCount:5})
      });
      if(!response.ok)return jsonError('Google Places tidak dapat mencari bisnis saat ini. Periksa API key dan konfigurasi Places API.',502);
      const data=await response.json() as {places?:Array<{id?:string;displayName?:{text?:string};formattedAddress?:string;googleMapsLinks?:{writeAReviewUri?:string}}>};
      const places=(data.places||[]).flatMap(place=>{
        const reviewURL=place.googleMapsLinks?.writeAReviewUri;
        if(!place.id||!place.displayName?.text||!reviewURL||!validReviewURL(reviewURL))return [];
        return [{id:place.id,name:place.displayName.text,address:place.formattedAddress||'',reviewURL}];
      });
      return NextResponse.json({ok:true,places},{headers:{'Cache-Control':'no-store'}});
    }catch{return jsonError('Pencarian Google Places gagal. Coba lagi sebentar.',502)}
  }
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
  const {code,activationCode,reviewURL,resolutionJobToken}=parsed.data;

  // Determine the destination. A card may be activated either with a direct official Google
  // review URL (unchanged manual flow) or with the verified output of a completed resolution
  // job. A raw Maps/share link is NEVER stored as if it were a verified review URL.
  let finalReviewUrl = reviewURL;
  let provenance: { placeId: string | null; method: string; sourceUrl: string | null; businessName: string | null; businessAddress: string | null } = {
    placeId: null, method: 'manual', sourceUrl: null, businessName: null, businessAddress: null,
  };

  if (resolutionJobToken) {
    const job = await getJobByToken(db, resolutionJobToken);
    if (!job) return jsonError('Hasil resolusi tidak ditemukan.', 400);
    if (job.card_code !== code) return jsonError('Hasil resolusi bukan untuk kartu ini.', 403);
    if (job.status !== 'success') return jsonError('Resolusi belum selesai atau gagal.', 409);
    if (!job.review_url || !isOfficialReviewUrl(job.review_url)) return jsonError('Hasil resolusi bukan tautan ulasan resmi.', 409);
    if (job.review_url !== reviewURL) return jsonError('Tautan tidak cocok dengan hasil resolusi.', 400);
    finalReviewUrl = job.review_url;
    provenance = {
      placeId: job.place_id,
      method: job.method || 'playwright',
      sourceUrl: job.input_url,
      businessName: job.business_name,
      businessAddress: job.business_address,
    };
  } else if (!isOfficialReviewUrl(reviewURL)) {
    return jsonError('Gunakan tautan Google Review langsung, atau selesaikan tautan Google Maps lewat resolusi otomatis.', 400);
  }

  const outcome=await transaction(async(tx)=>{
    const [card]=await tx.query<{id:number;active:number;secret_hash:string}>('SELECT id,active,secret_hash FROM cards WHERE code=? FOR UPDATE',[code]);
    if(!card)return 'missing' as const;if(card.active)return 'active' as const;
    if(!verifyActivationCode(activationCode,card.secret_hash))return 'secret' as const;
    // When a resolution job backs this activation, re-check its binding and expiry inside the
    // transaction so a job cannot be reused for another card or after it has expired.
    if (resolutionJobToken) {
      const [bound] = await tx.query<{id:number|string}>("SELECT id FROM resolution_jobs WHERE job_token=? AND card_code=? AND status='success' AND review_url=? AND expires_at > CURRENT_TIMESTAMP LIMIT 1", [resolutionJobToken, code, finalReviewUrl]);
      if (!bound) return 'stale' as const;
    }
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
  if(outcome==='stale')return jsonError('Hasil resolusi sudah kedaluwarsa. Selesaikan ulang tautan Google Maps.',409);
  return NextResponse.json({ok:true,reviewURL:finalReviewUrl});
}
