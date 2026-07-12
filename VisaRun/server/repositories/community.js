import { query } from '../db.js';

function mapCompanionRow(row) {
  return {
    id: row.id,
    author: row.author_name,
    route: row.route,
    date: row.post_date,
    seatsNeeded: row.seats_needed,
    message: row.message,
    transport: row.transport,
    createdAt: row.created_at,
  };
}

function mapBorderRow(row) {
  return {
    id: row.id,
    checkpointId: row.checkpoint_id,
    author: row.author_name,
    time: row.created_at,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function listCompanionPosts(limit = 50) {
  const result = await query(
    `SELECT * FROM companion_posts
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows.map(mapCompanionRow);
}

export async function createCompanionPost({
  id,
  clientId,
  authorName,
  route,
  postDate,
  seatsNeeded,
  message,
  transport,
}) {
  await query(
    `INSERT INTO companion_posts (
      id, client_id, author_name, route, post_date, seats_needed, message, transport
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, clientId, authorName, route, postDate, seatsNeeded, message, transport],
  );
}

export async function listBorderReports(checkpointId, limit = 50) {
  const result = await query(
    `SELECT * FROM border_reports
     WHERE checkpoint_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [checkpointId, limit],
  );
  return result.rows.map(mapBorderRow);
}

export async function createBorderReport({ id, clientId, checkpointId, authorName, message }) {
  await query(
    `INSERT INTO border_reports (id, client_id, checkpoint_id, author_name, message)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, clientId, checkpointId, authorName, message],
  );
}

export async function deleteCompanionPost(id, clientId) {
  const result = await query(
    'DELETE FROM companion_posts WHERE id = $1 AND client_id = $2',
    [id, clientId],
  );
  return result.rowCount > 0;
}

export async function deleteBorderReport(id, clientId) {
  const result = await query(
    'DELETE FROM border_reports WHERE id = $1 AND client_id = $2',
    [id, clientId],
  );
  return result.rowCount > 0;
}
