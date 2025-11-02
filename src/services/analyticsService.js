import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
let db;
export async function initDb() {
  db = await open({ filename: './analytics.db', driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, platform TEXT, external_id TEXT, topic TEXT, caption TEXT, url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  console.log('Analytics DB ready');
}
export async function recordPost(platform, externalId, topic, caption, url) {
  if (!db) await initDb();
  await db.run('INSERT INTO posts (platform, external_id, topic, caption, url) VALUES (?,?,?,?,?)', [platform, externalId, topic, caption, url]);
}
export async function recentPosts(limit=50) {
  if (!db) await initDb();
  return db.all('SELECT * FROM posts ORDER BY created_at DESC LIMIT ?', [limit]);
}
