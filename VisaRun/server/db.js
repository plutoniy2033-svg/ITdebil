import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'data', 'clients.db');

mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );
`);

export function findClientByEmail(email) {
  return db
    .prepare('SELECT * FROM clients WHERE email = ?')
    .get(email.toLowerCase().trim());
}

export function findClientById(id) {
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

export function createClient({ id, email, passwordHash, fullName, createdAt }) {
  db.prepare(
    `INSERT INTO clients (id, email, password_hash, full_name, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(id, email.toLowerCase().trim(), passwordHash, fullName.trim(), createdAt);
}

export function updateLastLogin(id, lastLoginAt) {
  db.prepare('UPDATE clients SET last_login_at = ? WHERE id = ?').run(lastLoginAt, id);
}

export function toPublicClient(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}
