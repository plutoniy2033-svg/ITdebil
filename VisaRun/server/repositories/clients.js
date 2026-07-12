import { query } from '../db.js';

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

export function findClientByEmail(email) {
  return query('SELECT * FROM clients WHERE email = $1', [normalizeEmail(email)]).then(
    (result) => result.rows[0] ?? null,
  );
}

export function findClientById(id) {
  return query('SELECT * FROM clients WHERE id = $1', [id]).then(
    (result) => result.rows[0] ?? null,
  );
}

export async function createClient({ id, email, passwordHash, fullName, createdAt }) {
  await query(
    `INSERT INTO clients (id, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, normalizeEmail(email), passwordHash, fullName.trim(), createdAt],
  );
}

export async function updateLastLogin(id, lastLoginAt) {
  await query('UPDATE clients SET last_login_at = $1 WHERE id = $2', [lastLoginAt, id]);
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
