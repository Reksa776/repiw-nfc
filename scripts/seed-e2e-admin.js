require('dotenv').config();
const {Pool}=require('pg');const crypto=require('node:crypto');
if(!process.env.REPIW_TEST_DATABASE_URL&&!process.env.DATABASE_URL)throw new Error('Set REPIW_TEST_DATABASE_URL to a dedicated test Supabase database.');
const pool=new Pool({connectionString:process.env.REPIW_TEST_DATABASE_URL||process.env.DATABASE_URL,max:1,application_name:'repiw-e2e-seed'});
(async()=>{const salt='e2e-test-only-salt',hash='scrypt$'+salt+'$'+crypto.scryptSync('e2e-test-admin-password',salt,64).toString('hex');try{await pool.query("INSERT INTO admins(username,password_hash) VALUES('admin',$1) ON CONFLICT(username) DO UPDATE SET password_hash=EXCLUDED.password_hash,updated_at=CURRENT_TIMESTAMP",[hash])}finally{await pool.end()}})().catch(e=>{console.error(e.message);process.exit(1)});
