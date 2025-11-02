import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/auto_meme' });
export async function initTokenStore() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS tokens (id SERIAL PRIMARY KEY, provider TEXT, key TEXT, value JSONB, created_at TIMESTAMP DEFAULT now());`);
  } finally { client.release(); }
}
export async function saveToken(provider, key, value) {
  const client = await pool.connect();
  try { await client.query('INSERT INTO tokens (provider, key, value) VALUES ($1,$2,$3)', [provider, key, JSON.stringify(value)]); } finally { client.release(); }
}
export async function getLatestToken(provider, key) {
  const client = await pool.connect();
  try { const res = await client.query('SELECT value FROM tokens WHERE provider=$1 AND key=$2 ORDER BY created_at DESC LIMIT 1', [provider, key]); if (res.rows.length) return JSON.parse(res.rows[0].value); return null; } finally { client.release(); }
}
