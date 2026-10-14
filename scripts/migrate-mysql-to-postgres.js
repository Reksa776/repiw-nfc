require('dotenv').config();
const mysql=require('mysql2/promise');const {Pool}=require('pg');const crypto=require('node:crypto');
const kind=String(process.argv[2]||'').toLowerCase();
if(!['demo','production'].includes(kind))throw new Error('Usage: npm run db:import-mysql -- <demo|production>');
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL for Supabase first.');
const sourceDatabase=(kind==='demo'?process.env.MYSQL_DEMO_DATABASE:process.env.MYSQL_DATABASE)?.trim();
if(!process.env.MYSQL_HOST||!process.env.MYSQL_USER||!sourceDatabase)throw new Error(`MySQL source is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_${kind==='demo'?'DEMO_DATABASE':'DATABASE'} in .env.`);
const oldDb=mysql.createPool({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD||'',database:sourceDatabase,waitForConnections:true,connectionLimit:1,charset:'utf8mb4',timezone:'Z',dateStrings:true,ssl:process.env.MYSQL_SSL==='true'?{rejectUnauthorized:true}:undefined});
const newDb=new Pool({connectionString:process.env.DATABASE_URL,max:1,application_name:`repiw-mysql-${kind}-import`});
(async()=>{
 try{
  const [cards] = await oldDb.query('SELECT id,code,secret_hash,active,review_url,activated_at,created_at FROM cards ORDER BY id');
  const [visits] = await oldDb.query('SELECT id,card_id,source,at FROM visits ORDER BY id');
  const sourceKey=crypto.createHash('sha256').update(JSON.stringify({kind,cards,visits})).digest('hex');
  const client=await newDb.connect();
  try{
   await client.query('BEGIN');
   if((await client.query('SELECT 1 FROM data_imports WHERE source_key=$1',[sourceKey])).rowCount){await client.query('ROLLBACK');console.log(JSON.stringify({ok:true,alreadyImported:true,source:kind,cards:cards.length,visits:visits.length},null,2));return;}
   const cardIds=new Map();
   for(const card of cards){
    const result=await client.query(`INSERT INTO cards(code,secret_hash,active,review_url,activated_at,demo,created_at) VALUES($1,$2,$3,$4,$5,$6,COALESCE($7::timestamp,CURRENT_TIMESTAMP)) ON CONFLICT(code) DO NOTHING RETURNING id`,[card.code,card.secret_hash,Number(card.active||0),card.review_url||null,card.activated_at||null,kind==='demo'?1:0,card.created_at||null]);
    let destination=result.rows[0];
    if(!destination){
     const [existing]= (await client.query('SELECT id,secret_hash,active,review_url,demo FROM cards WHERE code=$1',[card.code])).rows;
     if(!existing||existing.secret_hash!==card.secret_hash||Number(existing.active)!==Number(card.active||0)||existing.review_url!==(card.review_url||null)||Number(existing.demo)!==(kind==='demo'?1:0))throw new Error(`Card code conflict in Supabase: ${card.code}. No source rows were imported.`);
     destination=existing;
    }
    cardIds.set(Number(card.id),destination.id);
   }
   for(const visit of visits){const cardId=cardIds.get(Number(visit.card_id));if(!cardId)throw new Error(`MySQL visit ${visit.id} has no matching card.`);await client.query('INSERT INTO visits(card_id,source,at) VALUES($1,$2,COALESCE($3::timestamp,CURRENT_TIMESTAMP))',[cardId,visit.source,visit.at||null]);}
   await client.query('INSERT INTO data_imports(source_key,cards_count,visits_count) VALUES($1,$2,$3)',[sourceKey,cards.length,visits.length]);
   await client.query('COMMIT');
   console.log(JSON.stringify({ok:true,source:kind,database:sourceDatabase,imported:{cards:cards.length,visits:visits.length,admins:0,sessions:0,rateEvents:0},note:'Seed a fresh Supabase admin after import; card IDs and visit links are remapped by card code.'},null,2));
  }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
 }finally{await oldDb.end();await newDb.end()}
})().catch(e=>{console.error(`MySQL to Supabase import failed: ${e.message}`);process.exit(1)});
