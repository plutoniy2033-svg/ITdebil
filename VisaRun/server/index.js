import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import {
  createClient,
  findClientByEmail,
  findClientById,
  toPublicClient,
  updateLastLogin,
} from './db.js';
import { authMiddleware, signToken } from './middleware/auth.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body.email ?? '').trim();
  const password = String(req.body.password ?? '');
  const fullName = String(req.body.fullName ?? '').trim();

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (fullName.length < 2) {
    return res.status(400).json({ error: 'Full name is required' });
  }
  if (findClientByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  createClient({ id, email, passwordHash, fullName, createdAt });

  const token = signToken(id);
  res.status(201).json({ token, client: toPublicClient(findClientById(id)) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email ?? '').trim();
  const password = String(req.body.password ?? '');

  const client = findClientByEmail(email);
  if (!client) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, client.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const lastLoginAt = new Date().toISOString();
  updateLastLogin(client.id, lastLoginAt);

  const token = signToken(client.id);
  res.json({ token, client: toPublicClient(findClientById(client.id)) });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const client = findClientById(req.clientId);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  res.json({ client: toPublicClient(client) });
});

app.listen(PORT, () => {
  console.log(`VisaRun API running at http://localhost:${PORT}`);
});
