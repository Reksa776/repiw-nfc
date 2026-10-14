import QRCode from 'qrcode';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin,jsonError } from '@/lib/http';
import { safeBaseURL } from '@/lib/validation';
export const runtime='nodejs',dynamic='force-dynamic';
export async function GET(_req:Request,ctx:{params:Promise<{code:string}>}) {
  if(!await requireAdmin())return jsonError('Silakan login admin.',401);
  const {code}=await ctx.params;const [card]=await db.query<{code:string}>('SELECT code FROM cards WHERE code=? LIMIT 1',[code]);
  if(!card)return new NextResponse(null,{status:404});
  try {const png=await QRCode.toBuffer(`${safeBaseURL()}/c/${card.code}?src=qr`,{width:1000,margin:3,errorCorrectionLevel:'H'});
    return new NextResponse(new Uint8Array(png),{headers:{'Content-Type':'image/png','Cache-Control':'private, no-store','Content-Disposition':`attachment; filename="${card.code}.png"`}});
  }catch{return jsonError('QR tidak dapat dibuat.',500)}
}
