import {DemoReview} from '@/components/demo-review';
export default async function DemoReviewPage({searchParams}:{searchParams:Promise<{card?:string;src?:string}>}){const {card='REPIW',src='qr'}=await searchParams;return <DemoReview card={card} source={src}/>}
