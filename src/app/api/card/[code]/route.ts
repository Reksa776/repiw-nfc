import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export const runtime='nodejs',dynamic='force-dynamic';
export async function GET(_req:Request,ctx:{params:Promise<{code:string}>}) {
  const {code}=await ctx.params;
  const [card]=await db.query<{code:string;active:number;demo:number;activated_at:Date|string|null}>('SELECT code,active,demo,activated_at FROM cards WHERE code=? LIMIT 1',[code]);
  if(!card)return NextResponse.json({error:'Kartu tidak ditemukan.'},{status:404});
  return NextResponse.json({...card,active:!!card.active,demo:!!card.demo,activated_at:card.activated_at instanceof Date?card.activated_at.toISOString():card.activated_at},{headers:{'Cache-Control':'no-store'}});
}
