const {loadEnvConfig}=require('@next/env');const {DatabaseSync}=require('node:sqlite');const mysql=require('mysql2/promise');const path=require('node:path');
loadEnvConfig(process.cwd());
function mysqlConfig(){const demo=process.env.DEMO_MODE==='true',database=(demo?process.env.MYSQL_DEMO_DATABASE:process.env.MYSQL_DATABASE)?.trim(),host=process.env.MYSQL_HOST?.trim(),user=process.env.MYSQL_USER?.trim();if(!host||!user||!database)throw new Error(`Set MYSQL_HOST, MYSQL_USER, and ${demo?'MYSQL_DEMO_DATABASE':'MYSQL_DATABASE'} in .env first.`);const port=Number(process.env.MYSQL_PORT||3306);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('MYSQL_PORT must be a valid TCP port.');return {host,user,password:process.env.MYSQL_PASSWORD||'',database,port,charset:'utf8mb4',timezone:'Z',dateStrings:true,ssl:process.env.MYSQL_SSL==='true'?{rejectUnauthorized:true}:undefined}}
(async()=>{
 const source=process.argv[2];if(!source)throw new Error('Usage: npm run db:import-sqlite -- /absolute/path/to/repiw.sqlite');
 const file=path.resolve(source);const sqlite=new DatabaseSync(file,{readOnly:true});const pool=mysql.createPool({...mysqlConfig(),waitForConnections:true,connectionLimit:2});
 try{
  const tables=new Set(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name));
  if(!tables.has('cards')||!tables.has('visits'))throw new Error('Source SQLite file is missing cards or visits tables.');
  const get=(table)=>tables.has(table)?sqlite.prepare(`SELECT * FROM ${table}`).all():[];
  const cards=get('cards'),visits=get('visits'),admins=get('admins'),sessions=get('sessions');
  const conn=await pool.getConnection();
  try{
   await conn.beginTransaction();
   for(const x of cards)await conn.execute('INSERT IGNORE INTO cards(id,code,secret_hash,active,review_url,activated_at,demo,created_at) VALUES(?,?,?,?,?,?,?,?)',[x.id,x.code,x.secret_hash,x.active,x.review_url,x.activated_at||null,x.demo||0,x.created_at]);
   for(const x of admins)await conn.execute('INSERT IGNORE INTO admins(id,username,password_hash,created_at,updated_at) VALUES(?,?,?,?,?)',[x.id,x.username,x.password_hash,x.created_at,x.updated_at]);
   for(const x of visits)await conn.execute('INSERT IGNORE INTO visits(id,card_id,source,at) VALUES(?,?,?,?)',[x.id,x.card_id,x.source,x.at]);
   for(const x of sessions)await conn.execute('INSERT IGNORE INTO sessions(id_hash,admin_id,expires_at,created_at) VALUES(?,?,?,?)',[x.id_hash,x.admin_id??null,x.expires_at,x.created_at]);
   await conn.commit();
  }catch(e){await conn.rollback();throw e}finally{conn.release()}
  const [[cardCount]]=await pool.query('SELECT COUNT(*) AS count FROM cards');const [[visitCount]]=await pool.query('SELECT COUNT(*) AS count FROM visits');
  console.log(JSON.stringify({ok:true,source:file,database:mysqlConfig().database,imported:{cards:cards.length,visits:visits.length,admins:admins.length,sessions:sessions.length,rateEvents:'skipped (ephemeral rate-limit state)'},destination:{cards:Number(cardCount.count),visits:Number(visitCount.count)},note:'INSERT IGNORE preserves destination rows with matching primary or unique keys.'},null,2));
 }finally{sqlite.close();await pool.end()}
})().catch(e=>{console.error(`SQLite to MySQL import failed: ${e.message}`);process.exit(1)});
