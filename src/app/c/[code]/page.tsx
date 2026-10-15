import { notFound,redirect } from 'next/navigation';
import { db } from '@/lib/db';import { markNfcRegistered,recordVisit } from '@/lib/cards';
import { ActivationForm } from '@/components/activation-form';
export const runtime='nodejs',dynamic='force-dynamic';
export default async function CardPage({params,searchParams}:{params:Promise<{code:string}>;searchParams:Promise<{src?:string|string[]}>}){
 const {code}=await params,query=await searchParams;
 const [card]=await db.query<{id:number|string;code:string;active:number;demo:number;review_url:string|null}>('SELECT id,code,active,demo,review_url FROM cards WHERE code=? LIMIT 1',[code]);
 if(!card)notFound();const src=Array.isArray(query.src)?query.src[0]:query.src;const source=src==='nfc'?'nfc':'qr';
 if(source==='nfc'&&!card.active)await markNfcRegistered(Number(card.id));
 if(card.active){await recordVisit(Number(card.id),source);if(card.demo===1)redirect(`/demo-review?card=${encodeURIComponent(card.code)}&src=${source}`);if(!card.review_url)notFound();redirect(card.review_url);}
 return <ActivationForm code={card.code} source={source}/>;
}
