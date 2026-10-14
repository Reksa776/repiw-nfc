require('dotenv').config();
const errors=[];
if (process.env.DEMO_MODE === 'true') errors.push('DEMO_MODE must be false');
if (!process.env.BASE_URL?.startsWith('https://')) errors.push('BASE_URL must use HTTPS');
if (Buffer.byteLength(process.env.SESSION_SECRET || '') < 32) errors.push('SESSION_SECRET must contain at least 32 bytes');
if (!process.env.DATABASE_URL?.startsWith('postgres')) errors.push('DATABASE_URL must be a PostgreSQL connection string');
else {
  try {
    const sslMode = new URL(process.env.DATABASE_URL).searchParams.get('sslmode');
    if (!['require','verify-full'].includes(sslMode || '')) errors.push('DATABASE_URL must require TLS with sslmode=require or sslmode=verify-full');
  } catch { errors.push('DATABASE_URL is not a valid PostgreSQL URI'); }
}
if (process.env.TRUST_PROXY !== 'true') errors.push('Set TRUST_PROXY=true behind a trusted proxy which overwrites client IP headers');
if (errors.length) { console.error(`REPIW production configuration invalid:\n- ${errors.join('\n- ')}`); process.exit(1); }
