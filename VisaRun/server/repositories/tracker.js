import { query } from '../db.js';

const DEFAULT_TRACKER = {
  entryDate: '',
  exitDate: '',
  dayLimit: 45,
  location: 'Vietnam',
  citizenship: 'RU',
  entryType: 'visa-free',
  visaRunHistory: [],
};

function formatDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function mapRecord(row) {
  return {
    id: row.id,
    entryDate: formatDate(row.entry_date),
    checkpoint: row.checkpoint,
    entryType: row.entry_type,
    exitDate: row.exit_date ? formatDate(row.exit_date) : undefined,
  };
}

function mapProfile(row, historyRows) {
  if (!row) return { ...DEFAULT_TRACKER };
  return {
    entryDate: formatDate(row.entry_date),
    exitDate: formatDate(row.exit_date),
    dayLimit: row.day_limit,
    location: row.location,
    citizenship: row.citizenship,
    entryType: row.entry_type,
    visaRunHistory: historyRows.map(mapRecord),
  };
}

export async function getTrackerByClientId(clientId) {
  const [profileResult, historyResult] = await Promise.all([
    query('SELECT * FROM tracker_profiles WHERE client_id = $1', [clientId]),
    query(
      `SELECT * FROM visa_run_records
       WHERE client_id = $1
       ORDER BY entry_date DESC, created_at DESC`,
      [clientId],
    ),
  ]);

  return mapProfile(profileResult.rows[0], historyResult.rows);
}

export async function upsertTrackerProfile(clientId, profile) {
  await query(
    `INSERT INTO tracker_profiles (
      client_id, entry_date, exit_date, day_limit, location, citizenship, entry_type, updated_at
    ) VALUES ($1, NULLIF($2, ''), NULLIF($3, ''), $4, $5, $6, $7, NOW())
    ON CONFLICT (client_id) DO UPDATE SET
      entry_date = EXCLUDED.entry_date,
      exit_date = EXCLUDED.exit_date,
      day_limit = EXCLUDED.day_limit,
      location = EXCLUDED.location,
      citizenship = EXCLUDED.citizenship,
      entry_type = EXCLUDED.entry_type,
      updated_at = NOW()`,
    [
      clientId,
      profile.entryDate ?? '',
      profile.exitDate ?? '',
      profile.dayLimit,
      profile.location,
      profile.citizenship,
      profile.entryType,
    ],
  );
}

export async function addVisaRunRecord(clientId, record) {
  await query(
    `INSERT INTO visa_run_records (id, client_id, entry_date, checkpoint, entry_type, exit_date)
     VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''))`,
    [
      record.id,
      clientId,
      record.entryDate,
      record.checkpoint,
      record.entryType,
      record.exitDate ?? '',
    ],
  );
}

export async function deleteVisaRunRecord(clientId, recordId) {
  const result = await query(
    'DELETE FROM visa_run_records WHERE id = $1 AND client_id = $2',
    [recordId, clientId],
  );
  return result.rowCount > 0;
}

export async function replaceTrackerState(clientId, state) {
  await upsertTrackerProfile(clientId, state);

  await query('DELETE FROM visa_run_records WHERE client_id = $1', [clientId]);

  for (const record of state.visaRunHistory ?? []) {
    await addVisaRunRecord(clientId, record);
  }
}
