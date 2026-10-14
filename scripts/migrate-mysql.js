const {loadEnvConfig}=require('@next/env');
const mysql=require('mysql2/promise');
loadEnvConfig(process.cwd());
function config(){
 const demo=process.env.DEMO_MODE==='true';const database=(demo?process.env.MYSQL_DEMO_DATABASE:process.env.MYSQL_DATABASE)?.trim();
 const host=process.env.MYSQL_HOST?.trim(),user=process.env.MYSQL_USER?.trim();
 if(!host||!user||!database)throw new Error(`Set MYSQL_HOST, MYSQL_USER, and ${demo?'MYSQL_DEMO_DATABASE':'MYSQL_DATABASE'} in .env first.`);
 const port=Number(process.env.MYSQL_PORT||3306);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('MYSQL_PORT must be a valid TCP port.');
 return {host,user,password:process.env.MYSQL_PASSWORD||'',database,port,charset:'utf8mb4',timezone:'Z',dateStrings:true,ssl:process.env.MYSQL_SSL==='true'?{rejectUnauthorized:true}:undefined};
}
(async()=>{
 const pool= mysql.createPool({...config(),waitForConnections:true,connectionLimit:2});
 try{
  const ddl=[
   `CREATE TABLE IF NOT EXISTS cards(id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,code VARCHAR(32) NOT NULL UNIQUE,secret_hash VARCHAR(255) NOT NULL,active TINYINT(1) NOT NULL DEFAULT 0,review_url VARCHAR(2048) NULL,activated_at DATETIME NULL,demo TINYINT(1) NOT NULL DEFAULT 0,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,INDEX idx_cards_created(created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
   `CREATE TABLE IF NOT EXISTS visits(id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,card_id INT UNSIGNED NOT NULL,source ENUM('qr','nfc') NOT NULL,at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,INDEX idx_visits_card_source(card_id,source),CONSTRAINT fk_visits_card FOREIGN KEY(card_id) REFERENCES cards(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
   `CREATE TABLE IF NOT EXISTS admins(id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,username VARCHAR(80) NOT NULL UNIQUE,password_hash VARCHAR(255) NOT NULL,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
   `CREATE TABLE IF NOT EXISTS sessions(id_hash CHAR(64) NOT NULL PRIMARY KEY,admin_id INT UNSIGNED NULL,expires_at BIGINT NOT NULL,created_at BIGINT NOT NULL,INDEX idx_sessions_admin(admin_id),INDEX idx_sessions_expires(expires_at),CONSTRAINT fk_sessions_admin FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
   `CREATE TABLE IF NOT EXISTS rate_events(id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,bucket VARCHAR(100) NOT NULL,at BIGINT NOT NULL,INDEX idx_rate_events_bucket_at(bucket,at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
   `CREATE TABLE IF NOT EXISTS schema_migrations(version INT NOT NULL PRIMARY KEY,applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];
  for(const sql of ddl)await pool.query(sql);
  await pool.execute('INSERT IGNORE INTO schema_migrations(version) VALUES(1)');
  await pool.execute('DELETE FROM sessions WHERE expires_at<=?', [Date.now()]);
  const [[cards]] = await pool.query('SELECT COUNT(*) AS count FROM cards');
  const [[visits]] = await pool.query('SELECT COUNT(*) AS count FROM visits');
  console.log(JSON.stringify({ok:true,database:config().database,schemaVersion:1,rows:{cards:Number(cards.count),visits:Number(visits.count)}},null,2));
 }finally{await pool.end()}
})().catch(e=>{console.error(`MySQL migration failed: ${e.message}`);process.exit(1)});
