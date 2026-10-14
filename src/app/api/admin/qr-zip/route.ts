import archiver from 'archiver';
import QRCode from 'qrcode';
import { PassThrough,Readable } from 'node:stream';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin,jsonError } from '@/lib/http';
import { demo } from '@/lib/db';
import { safeBaseURL } from '@/lib/validation';
export const runtime='nodejs',dynamic='force-dynamic';
export async function GET() {
  if(!await requireAdmin())return jsonError('Silakan login admin.',401);
  try {
    const base=safeBaseURL(),cards=await db.query<{code:string}>('SELECT code FROM cards WHERE demo=? ORDER BY id',[demo?1:0]);
    const pass=new PassThrough(),zip=archiver('zip',{zlib:{level:8}});zip.on('error',(e)=>pass.destroy(e));zip.pipe(pass);
    for(const card of cards)zip.append(await QRCode.toBuffer(`${base}/c/${card.code}?src=qr`,{width:1000,margin:3,errorCorrectionLevel:'H'}),{name:`${card.code}.png`});
    await zip.finalize();
    return new NextResponse(Readable.toWeb(pass) as ReadableStream,{headers:{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="repiw-qr.zip"','Cache-Control':'private, no-store'}});
  }catch{return jsonError('Arsip QR tidak dapat dibuat.',500)}
}
