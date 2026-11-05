import { NextRequest,NextResponse } from 'next/server';
import { db,makeActivationCode,makeCode,transaction,demo } from '@/lib/db';
import { encryptActivationCode,hashActivationCode } from '@/lib/security';
import { generateSchema,safeBaseURL } from '@/lib/validation';
import { requireAdmin,jsonError,sameOrigin } from '@/lib/http';
import QRCode from 'qrcode';
import { googleDriveConfigured,refreshCardImageReservations,reserveCardImageNumbers,uploadCardQrImage } from '@/lib/google-drive';
export const runtime='nodejs';
export async function POST(req:NextRequest) {
  if(!sameOrigin(req)) return jsonError('Permintaan lintas situs ditolak.',403);
  if(!await requireAdmin()) return jsonError('Silakan login admin.',401);
  let body:unknown; try{body=await req.json()}catch{return jsonError('Format permintaan tidak valid.',400)}
  const parsed=generateSchema.safeParse(body); if(!parsed.success)return jsonError('Jumlah harus antara 1 dan 100.',400);
  let base:string; try{base=safeBaseURL()}catch{return jsonError('BASE_URL belum dikonfigurasi dengan benar.',500)}
  const items:Array<{code:string;activationCode:string;qrURL:string;nfcURL:string;driveUrl?:string;driveFileName?:string;driveError?:string}> = [];
  try {
    await transaction(async (tx)=>{
      for(let i=0;i<parsed.data.count;i++) {
        let code=makeCode(), secret=makeActivationCode(), attempts=0;
        while(true) {
          const inserted=await tx.query<{id:number|string}>('INSERT INTO cards(code,secret_hash,demo,activation_code_encrypted) VALUES(?,?,?,?) ON CONFLICT(code) DO NOTHING RETURNING id',[code,hashActivationCode(secret),demo?1:0,encryptActivationCode(secret)]);
          if(inserted.length)break;
          if(++attempts>4)throw new Error('Could not allocate a unique card ID.');
          code=makeCode();
        }
        items.push({code,activationCode:secret,qrURL:`${base}/c/${code}?src=qr`,nfcURL:`${base}/c/${code}?src=nfc`});
      }
    });
  } catch(e) { console.error('card generation failed',e); return jsonError('Kartu tidak dapat dibuat saat ini.',500); }
  if (googleDriveConfigured()) {
    let numbers: number[] = [];
    try {
      numbers = await reserveCardImageNumbers(items.length);
    } catch (error) {
      console.error('Could not reserve Google Drive image names',error);
      for (const item of items) item.driveError = error instanceof Error ? error.message.slice(0,180) : 'Upload gagal';
    }
    for (const [index,item] of items.entries()) {
      if (!numbers.length) break;
      try {
        await refreshCardImageReservations(numbers);
        const qrImage = await QRCode.toBuffer(item.qrURL,{type:'png',width:600,margin:2,errorCorrectionLevel:'H'});
        const fileNumber = numbers[index];
        const uploaded = await uploadCardQrImage(fileNumber,qrImage);
        item.driveUrl = uploaded.webViewLink;
        item.driveFileName = String(fileNumber);
        await db.execute('UPDATE cards SET drive_file_name=?,drive_file_url=? WHERE code=? AND demo=?',[item.driveFileName,uploaded.webViewLink,item.code,demo?1:0]);
      } catch (error) {
        console.error(`Could not upload QR image for ${item.code} to Google Drive`,error);
        item.driveError = error instanceof Error ? error.message.slice(0,180) : 'Upload gagal';
      }
    }
  } else {
    for (const item of items) item.driveError = 'Drive belum dikonfigurasi';
  }
  const uploadedCount = items.filter(item=>item.driveUrl).length;
  const notice = googleDriveConfigured()
    ? `Unduh CSV sekarang. Kode aktivasi hanya ditampilkan sekali. Gambar QR di Drive: ${uploadedCount}/${items.length}.`
    : 'Kartu berhasil dibuat, tetapi Google Drive belum dikonfigurasi. Kode aktivasi hanya ditampilkan sekali.';
  return NextResponse.json({items,notice},{headers:{'Cache-Control':'no-store'}});
}
