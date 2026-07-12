import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import { pool } from './db.js';
import { runMigrations } from './migrate.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import trackerRoutes from './routes/tracker.js';
import settingsRoutes from './routes/settings.js';
import communityRoutes from './routes/community.js';
import { getCorsOptions } from './utils/validation.js';

validateConfig();
await runMigrations();

const app = express();

app.use(cors(getCorsOptions()));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch {
    res.status(503).json({ ok: false, database: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/community', communityRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`VisaRun API running at http://localhost:${config.port}`);
});
