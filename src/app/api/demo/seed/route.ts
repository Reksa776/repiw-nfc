import { NextRequest,NextResponse } from 'next/server';import { db,demo,makeActivationCode,makeCode,transaction } from '@/lib/db';import { hashActivationCode } from '@/lib/security';import { requireAdmin,jsonError,sameOrigin } from '@/lib/http';
export const runtime='nodejs';
const reviews=['https://g.page/r/repiw-demo-kopi/review','https://maps.app.goo.gl/repiwDemoCafe','https://www.google.com/maps/place/Repiw+Demo+Barbershop','https://g.page/r/repiw-demo-laundry/review'];
const stamp=(date:Date)=>date.toISOString().slice(0,19).replace('T',' ');
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return jsonError('Permintaan lintas situs ditolak.',403);if(!await requireAdmin())return jsonError('Silakan login admin.',401);if(!demo)return jsonError('Mode demo tidak aktif.',404);
 const now=Date.now(),inactive:Array<{code:string;activationCode:string}>=[];let visits=0;
 await transaction(async(tx)=>{
  await tx.execute('DELETE FROM cards WHERE demo=1');
  for(let i=0;i<16;i++){
   const code=makeCode(),secret=makeActivationCode(),created=new Date(now-(5+Math.floor(Math.random()*45))*86400000),active=i<10;
   const activated=active?new Date(Math.min(created.getTime()+(1+Math.floor(Math.random()*8))*86400000,now-3600000)):null;
   const inserted=await tx.query<{id:number|string}>('INSERT INTO cards(code,secret_hash,active,review_url,activated_at,demo,created_at) VALUES(?,?,?,?,?,1,?) RETURNING id',[code,hashActivationCode(secret),active?1:0,active?reviews[i%reviews.length]:null,activated?stamp(activated):null,stamp(created)]);
   const id=Number(inserted[0].id);
   if(active&&activated){for(const [source,n] of [['nfc',4+Math.floor(Math.random()*20)],['qr',7+Math.floor(Math.random()*35)]] as const){for(let j=0;j<n;j++){const at=new Date(activated.getTime()+Math.random()*Math.max(now-activated.getTime(),3600000));await tx.execute('INSERT INTO visits(card_id,source,at) VALUES(?,?,?)',[id,source,stamp(at)]);visits++;}}}
   else inactive.push({code,activationCode:secret});
  }
 });
 return NextResponse.json({ok:true,total:16,active:10,inactive:6,visits,inactiveCards:inactive},{headers:{'Cache-Control':'no-store'}});
}
