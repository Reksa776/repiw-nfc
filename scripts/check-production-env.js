require('dotenv').config();
const errors=[];
if (process.env.DEMO_MODE === 'true') errors.push('DEMO_MODE must be false');
if (!process.env.BASE_URL?.startsWith('https://')) errors.push('BASE_URL must use HTTPS');
if (Buffer.byteLength(process.env.SESSION_SECRET || '') < 32) errors.push('SESSION_SECRET must contain at least 32 bytes');
if (!process.env.MYSQL_HOST) errors.push('MYSQL_HOST is required');
if (!process.env.MYSQL_USER) errors.push('MYSQL_USER is required');
if (!process.env.MYSQL_DATABASE) errors.push('MYSQL_DATABASE is required');
if (!process.env.MYSQL_PASSWORD) errors.push('MYSQL_PASSWORD is required in production');
if (!process.env.MYSQL_DEMO_DATABASE) errors.push('MYSQL_DEMO_DATABASE is required');
if (process.env.TRUST_PROXY !== 'true') errors.push('Set TRUST_PROXY=true behind a trusted proxy which overwrites client IP headers');
if (errors.length) { console.error(`REPIW production configuration invalid:\n- ${errors.join('\n- ')}`); process.exit(1); }
