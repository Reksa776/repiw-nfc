import { NextRequest,NextResponse } from 'next/server';
import { db,makeActivationCode,makeCode,transaction,demo } from '@/lib/db';
import { hashActivationCode } from '@/lib/security';
import { generateSchema,safeBaseURL } from '@/lib/validation';
import { requireAdmin,jsonError,sameOrigin } from '@/lib/http';
export const runtime='nodejs';
export async function POST(req:NextRequest) {
  if(!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.',403);
  if(!await requireAdmin()) return jsonError('Silakan login admin.',401);
  let body:unknown; try{body=await req.json()}catch{return jsonError('Format permintaan tidak valid.',400)}
  const parsed=generateSchema.safeParse(body); if(!parsed.success)return jsonError('Jumlah harus antara 1 dan 100.',400);
  let base:string; try{base=safeBaseURL()}catch{return jsonError('BASE_URL belum dikonfigurasi dengan benar.',500)}
  const items:Array<{code:string;activationCode:string;qrURL:string;nfcURL:string}> = [];
  try {
    await transaction(async (tx)=>{
      for(let i=0;i<parsed.data.count;i++) {
        let code=makeCode(), secret=makeActivationCode(), attempts=0;
        while(true) {
          const inserted=await tx.query<{id:number|string}>('INSERT INTO cards(code,secret_hash,demo) VALUES(?,?,?) ON CONFLICT(code) DO NOTHING RETURNING id',[code,hashActivationCode(secret),demo?1:0]);
          if(inserted.length)break;
          if(++attempts>4)throw new Error('Could not allocate a unique card ID.');
          code=makeCode();
        }
        items.push({code,activationCode:secret,qrURL:`${base}/c/${code}?src=qr`,nfcURL:`${base}/c/${code}?src=nfc`});
      }
    });
  } catch(e) { console.error('card generation failed',e); return jsonError('Kartu tidak dapat dibuat saat ini.',500); }
  return NextResponse.json({items,notice:'Unduh CSV sekarang. Kode aktivasi hanya ditampilkan sekali.'},{headers:{'Cache-Control':'no-store'}});
}
