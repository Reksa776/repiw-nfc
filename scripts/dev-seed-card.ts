// DEV-ONLY: seed an admin and inactive cards with known activation codes into the ephemeral
// test database (see scripts/dev-pglite-server.ts). Never run against production data.

import 'dotenv/config';
import crypto from 'node:crypto';
import { Pool } from 'pg';
import { hashActivationCode, encryptActivationCode } from '../src/lib/security';

const DATABASE_URL = process.env.DATABASE_URL?.trim();
if (!DATABASE_URL) { console.error('DATABASE_URL is required.'); process.exit(1); }

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  const client = await pool.connect();
  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = `scrypt$${salt}$${crypto.scryptSync('devpassword123', salt, 64).toString('hex')}`;
    await client.query("INSERT INTO admins(username,password_hash) VALUES('admin',$1) ON CONFLICT(username) DO UPDATE SET password_hash=EXCLUDED.password_hash", [passwordHash]);

    const cards: Array<{ code: string; activationCode: string }> = [];
    for (let i = 0; i < 3; i++) {
      const code = `RP-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
      const activationCode = ['A7KD', 'B2XZ', 'C4MP'][i];
      await client.query(
        'INSERT INTO cards(code,secret_hash,demo,activation_code_encrypted) VALUES($1,$2,$3,$4)',
        [code, hashActivationCode(activationCode), 1, encryptActivationCode(activationCode)],
      );
      cards.push({ code, activationCode });
    }
    const direct = `RP-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    await client.query(
      "INSERT INTO cards(code,secret_hash,active,review_url,activated_at,demo,created_at,place_id,resolution_status) VALUES($1,$2,1,$3,CURRENT_TIMESTAMP,1,CURRENT_TIMESTAMP,$4,'verified')",
      [direct, hashActivationCode('D5RT'), 'https://maps.app.goo.gl/legacyMapsPlace', null],
    );
    console.log(JSON.stringify({ admin: 'admin', password: 'devpassword123', cards, legacyCard: direct }, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
