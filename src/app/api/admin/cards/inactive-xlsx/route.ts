import archiver from 'archiver';
import QRCode from 'qrcode';
import { PassThrough, Readable } from 'node:stream';
import { NextResponse } from 'next/server';
import { db, demo } from '@/lib/db';
import { decryptActivationCode } from '@/lib/security';
import { requireAdmin, jsonError } from '@/lib/http';
import { safeBaseURL } from '@/lib/validation';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

function xml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function cell(ref: string, value: string) {
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
}

export async function GET() {
  if (!await requireAdmin()) return jsonError('Silakan login admin.', 401);

  try {
    const rows = await db.query<{ code: string; activation_code_encrypted: string | null }>(
      'SELECT code,activation_code_encrypted FROM cards WHERE demo=? AND active=0 ORDER BY id',
      [demo ? 1 : 0],
    );
    const base = safeBaseURL();
    const images: Buffer[] = [];
    const sheetRows = [
      `<row r="1">${cell('A1', 'ID Kartu')}${cell('B1', 'Kode Aktivasi')}${cell('C1', 'QR')}</row>`,
    ];
    const anchors: string[] = [];

    for (let index = 0; index < rows.length; index++) {
      const rowNumber = index + 2;
      const item = rows[index];
      const url = `${base}/c/${item.code}?src=qr`;
      const activationCode = item.activation_code_encrypted ? decryptActivationCode(item.activation_code_encrypted) : '';
      images.push(await QRCode.toBuffer(url, { width: 120, margin: 1, errorCorrectionLevel: 'H' }));
      sheetRows.push(`<row r="${rowNumber}" ht="96" customHeight="1">${cell(`A${rowNumber}`, item.code)}${cell(`B${rowNumber}`, activationCode)}<c r="C${rowNumber}"/></row>`);
      anchors.push(`<xdr:oneCellAnchor><xdr:from><xdr:col>2</xdr:col><xdr:colOff>95250</xdr:colOff><xdr:row>${rowNumber - 1}</xdr:row><xdr:rowOff>47625</xdr:rowOff></xdr:from><xdr:ext cx="1047750" cy="1047750"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${index + 2}" name="QR ${xml(item.code)}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId${index + 1}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`);
    }

    const pass = new PassThrough();
    const zip = archiver('zip', { zlib: { level: 6 } });
    zip.on('error', error => pass.destroy(error));
    zip.pipe(pass);
    const files: Record<string, string> = {
      '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`,
      '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Kartu Nonaktif" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
      'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetFormatPr defaultRowHeight="20"/><cols><col min="1" max="1" width="25" customWidth="1"/><col min="2" max="2" width="20" customWidth="1"/><col min="3" max="3" width="20" customWidth="1"/></cols><sheetData>${sheetRows.join('')}</sheetData><drawing r:id="rId1"/></worksheet>`,
      'xl/worksheets/_rels/sheet1.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`,
      'xl/drawings/drawing1.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${anchors.join('')}</xdr:wsDr>`,
      'xl/drawings/_rels/drawing1.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${images.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/qr${index + 1}.png"/>`).join('')}</Relationships>`,
    };
    for (const [name, content] of Object.entries(files)) zip.append(content, { name });
    images.forEach((image, index) => zip.append(image, { name: `xl/media/qr${index + 1}.png` }));
    void zip.finalize();

    return new NextResponse(Readable.toWeb(pass) as ReadableStream, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="repiw-kartu-belum-aktif.xlsx"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Could not export inactive cards to XLSX', error);
    return jsonError('File Excel kartu nonaktif tidak dapat dibuat. Periksa kunci enkripsi kode aktivasi.', 500);
  }
}
