import 'server-only';
import { db, demo } from './db';
export async function recordVisit(cardId: number, source: 'qr'|'nfc') {
  await db.execute('INSERT INTO visits(card_id,source) VALUES (?,?)', [cardId, source]);
}
export async function stats() {
  const [cards] = await db.query<{total:number|string;active:number|string}>(`SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN active=1 THEN 1 ELSE 0 END),0) AS active FROM cards WHERE demo=?`,[demo?1:0]);
  const events = await db.query<{source:string;n:number|string}>('SELECT v.source, COUNT(*) AS n FROM visits v JOIN cards c ON c.id=v.card_id WHERE c.demo=? GROUP BY v.source',[demo?1:0]);
  const total=Number(cards?.total||0),active=Number(cards?.active||0);
  return { total, active, inactive:total-active, nfc:Number(events.find(v=>v.source==='nfc')?.n||0), qr:Number(events.find(v=>v.source==='qr')?.n||0) };
}
export async function listCards() {
  return db.query(`SELECT c.code,c.active,c.demo,TO_CHAR(c.activated_at,'YYYY-MM-DD HH24:MI:SS') AS activated_at,TO_CHAR(c.created_at,'YYYY-MM-DD HH24:MI:SS') AS created_at,
    (SELECT COUNT(*) FROM visits v WHERE v.card_id=c.id AND v.source='nfc') AS nfc,
    (SELECT COUNT(*) FROM visits v WHERE v.card_id=c.id AND v.source='qr') AS qr
    FROM cards c WHERE c.demo=? ORDER BY c.id DESC LIMIT 500`,[demo?1:0]);
}
