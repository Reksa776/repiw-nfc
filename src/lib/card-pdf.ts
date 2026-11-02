import QRCode from 'qrcode';
import { deflateSync } from 'node:zlib';

function pdfText(text: string, font: 'F1' | 'F2', size: number, x: number, y: number, color = '0.10 0.16 0.14') {
  const safe = text.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
  return `${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${safe}) Tj ET\n`;
}

function makePdf(content: string) {
  const compressed = deflateSync(Buffer.from(content, 'ascii'));
  const objects: Buffer[] = [
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>'),
    Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'),
    Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'),
    Buffer.concat([Buffer.from(`<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`), compressed, Buffer.from('\nendstream')]),
  ];
  const chunks: Buffer[] = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'binary')];
  const offsets = [0];
  let length = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(length);
    const wrapped = Buffer.concat([Buffer.from(`${index + 1} 0 obj\n`), object, Buffer.from('\nendobj\n')]);
    chunks.push(wrapped);
    length += wrapped.length;
  });
  const xrefOffset = length;
  const xref = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, ...offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`)].join('');
  chunks.push(Buffer.from(`${xref}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));
  return Buffer.concat(chunks);
}

export function createCardActivationPdf(cardCode: string, activationCode: string, qrUrl: string) {
  const matrix = QRCode.create(qrUrl, { errorCorrectionLevel: 'H' }).modules;
  const qrSize = 300;
  const modulesWithQuietZone = matrix.size + 8;
  const moduleSize = qrSize / modulesWithQuietZone;
  const qrX = (595 - qrSize) / 2;
  const qrY = 190;
  let content = '1 1 1 rg 0 0 595 842 re f\n';
  content += '0.08 0.28 0.22 rg 0 748 595 94 re f\n';
  content += pdfText('repiw.', 'F2', 26, 50, 790, '1 1 1');
  content += pdfText('KARTU DIGITAL', 'F2', 9, 50, 766, '0.77 0.91 0.85');
  content += pdfText('AKTIVASI KARTU', 'F2', 23, 50, 700);
  content += pdfText('Pindai QR, lalu masukkan kode aktivasi berikut.', 'F1', 11, 50, 678, '0.37 0.43 0.40');
  content += '0.93 0.97 0.95 rg 50 584 495 66 re f\n';
  content += pdfText('ID KARTU', 'F2', 8, 68, 624, '0.37 0.43 0.40');
  content += pdfText(cardCode, 'F2', 14, 68, 600);
  content += pdfText('KODE AKTIVASI', 'F2', 8, 310, 624, '0.37 0.43 0.40');
  content += pdfText(activationCode, 'F2', 20, 310, 596, '0.08 0.42 0.30');
  content += '1 1 1 rg ' + `${qrX} ${qrY} ${qrSize} ${qrSize} re f\n`;
  content += '0 0 0 rg\n';
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (!matrix.get(row, col)) continue;
      const x = qrX + (col + 4) * moduleSize;
      const y = qrY + (matrix.size - row + 3) * moduleSize;
      content += `${x.toFixed(3)} ${y.toFixed(3)} ${moduleSize.toFixed(3)} ${moduleSize.toFixed(3)} re\n`;
    }
  }
  content += 'f\n';
  content += pdfText('SCAN QR UNTUK MEMBUKA FORM AKTIVASI', 'F2', 10, 153, 164, '0.08 0.42 0.30');
  content += pdfText(`ID: ${cardCode}`, 'F1', 9, 50, 84, '0.50 0.56 0.53');
  content += pdfText('Simpan kode ini dengan aman. Kode hanya dapat digunakan satu kali.', 'F1', 9, 50, 66, '0.50 0.56 0.53');
  return makePdf(content);
}
