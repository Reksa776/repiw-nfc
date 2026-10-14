import 'server-only';
import { db } from './db';
export async function recordVisit(cardId: number, source: 'qr'|'nfc') {
  await db.execute('INSERT INTO visits(card_id,source) VALUES (?,?)', [cardId, source]);
}
export async function stats() {
  const [cards] = await db.query<{total:number|string;active:number|string}>('SELECT COUNT(*) AS total, COALESCE(SUM(active),0) AS active FROM cards');
  const events = await db.query<{source:string;n:number|string}>('SELECT source, COUNT(*) AS n FROM visits GROUP BY source');
  const total=Number(cards?.total||0),active=Number(cards?.active||0);
  return { total, active, inactive:total-active, nfc:Number(events.find(v=>v.source==='nfc')?.n||0), qr:Number(events.find(v=>v.source==='qr')?.n||0) };
}
export async function listCards() {
  return db.query(`SELECT c.code,c.active,c.demo,c.activated_at,c.created_at,
    (SELECT COUNT(*) FROM visits v WHERE v.card_id=c.id AND v.source='nfc') AS nfc,
    (SELECT COUNT(*) FROM visits v WHERE v.card_id=c.id AND v.source='qr') AS qr
    FROM cards c ORDER BY c.id DESC LIMIT 500`);
}
