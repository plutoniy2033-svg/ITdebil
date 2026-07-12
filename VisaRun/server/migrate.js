import { readdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './db.js';
import { config, validateConfig } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrationIds() {
  const result = await query('SELECT id FROM schema_migrations ORDER BY id');
  return new Set(result.rows.map((row) => row.id));
}

export async function runMigrations() {
  validateConfig();
  await ensureMigrationsTable();

  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith('.sql'))
    .sort();

  const applied = await getAppliedMigrationIds();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = await readFile(join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied migration: ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

if (process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(() => {
      console.log('Migrations complete.');
      return pool.end();
    })
    .catch(async (error) => {
      console.error('Migration failed:', error.message);
      await pool.end();
      process.exit(1);
    });
}
