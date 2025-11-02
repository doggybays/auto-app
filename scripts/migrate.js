import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function migrate() {
  await client.connect();
  console.log('Connected to Postgres, running migrations...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS tokens (
      id SERIAL PRIMARY KEY,
      provider TEXT,
      key TEXT,
      value JSONB,
      created_at TIMESTAMP DEFAULT now()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      platform TEXT,
      external_id TEXT,
      topic TEXT,
      caption TEXT,
      url TEXT,
      created_at TIMESTAMP DEFAULT now()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      payload JSONB,
      status TEXT,
      result JSONB,
      created_at TIMESTAMP DEFAULT now()
    );
  `);
  console.log('Migrations complete.');
  await client.end();
}
migrate().catch(err => { console.error(err); process.exit(1); });
