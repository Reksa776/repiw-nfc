require('dotenv').config();
const {DatabaseSync}=require('node:sqlite');const {Pool}=require('pg');const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const source=process.argv[2];if(!source)throw new Error('Usage: npm run db:import-sqlite -- /absolute/path/to/repiw.sqlite');
const file=path.resolve(source);if(!fs.existsSync(file))throw new Error(`SQLite database was not found: ${file}`);if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL in .env first.');
const sqlite=new DatabaseSync(file,{readOnly:true}),pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,application_name:'repiw-sqlite-import'});
(async()=>{
 const tables=new Set(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name));
 if(!tables.has('cards')||!tables.has('visits'))throw new Error('SQLite source must have cards and visits tables.');
 const columns=table=>new Set(sqlite.prepare(`PRAGMA table_info(${table})`).all().map(x=>x.name));
 const cardColumns=columns('cards'), cards=sqlite.prepare('SELECT * FROM cards ORDER BY id').all(),visits=sqlite.prepare('SELECT * FROM visits ORDER BY id').all();
 const admins=tables.has('admins')?sqlite.prepare('SELECT * FROM admins').all():[];
 const dataKey=crypto.createHash('sha256').update(JSON.stringify({cards,visits,admins})).digest('hex');
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const prior=await client.query('SELECT 1 FROM data_imports WHERE source_key=$1',[dataKey]);
  if(prior.rowCount){await client.query('ROLLBACK');console.log(JSON.stringify({ok:true,alreadyImported:true,source:file,cards:cards.length,visits:visits.length},null,2));return;}
  const ids=new Map();
  for(const c of cards){
   const active=Number(c.active||0),demoValue=Number(cardColumns.has('demo')?c.demo:0);
   await client.query(`INSERT INTO cards(code,secret_hash,active,review_url,activated_at,demo,created_at) VALUES($1,$2,$3,$4,$5,$6,COALESCE($7::timestamp,CURRENT_TIMESTAMP)) ON CONFLICT(code) DO NOTHING`,[c.code,c.secret_hash,active,c.review_url||null,c.activated_at||null,demoValue,c.created_at||null]);
   const row=await client.query('SELECT id FROM cards WHERE code=$1',[c.code]);if(!row.rowCount)throw new Error(`Could not map card ${c.code}`);ids.set(Number(c.id),row.rows[0].id);
  }
  for(const v of visits){const cardId=ids.get(Number(v.card_id));if(!cardId)throw new Error(`Visit ${v.id} has no matching card row.`);await client.query('INSERT INTO visits(card_id,source,at) VALUES($1,$2,$3)',[cardId,v.source,v.at||null]);}
  for(const a of admins)await client.query(`INSERT INTO admins(username,password_hash,created_at,updated_at) VALUES($1,$2,COALESCE($3::timestamp,CURRENT_TIMESTAMP),COALESCE($4::timestamp,CURRENT_TIMESTAMP)) ON CONFLICT(username) DO NOTHING`,[String(a.username).toLowerCase(),a.password_hash,a.created_at||null,a.updated_at||null]);
  await client.query('INSERT INTO data_imports(source_key,cards_count,visits_count) VALUES($1,$2,$3)',[dataKey,cards.length,visits.length]);await client.query('COMMIT');
  console.log(JSON.stringify({ok:true,source:file,imported:{cards:cards.length,visits:visits.length,admins:admins.length,sessions:0,rateEvents:0},note:'Sessions and rate-limit history are skipped. Re-seed admin if no usable SQLite admin exists.'},null,2));
 }catch(error){await client.query('ROLLBACK');throw error}finally{client.release();await pool.end();sqlite.close()}
})().catch(async e=>{console.error(`SQLite import failed: ${e.message}`);try{await pool.end()}catch{}try{sqlite.close()}catch{}process.exit(1)});
