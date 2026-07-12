import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import {
  createClient,
  findClientByEmail,
  findClientById,
  toPublicClient,
  updateLastLogin,
} from '../repositories/clients.js';
import { ensureDefaultSettings } from '../repositories/settings.js';
import { signToken } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateEmail } from '../utils/validation.js';

const router = Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
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
    if (await findClientByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    await createClient({ id, email, passwordHash, fullName, createdAt });
    await ensureDefaultSettings(id);

    const token = signToken(id);
    res.status(201).json({ token, client: toPublicClient(await findClientById(id)) });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email ?? '').trim();
    const password = String(req.body.password ?? '');

    const client = await findClientByEmail(email);
    if (!client) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, client.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const lastLoginAt = new Date().toISOString();
    await updateLastLogin(client.id, lastLoginAt);

    const token = signToken(client.id);
    res.json({ token, client: toPublicClient(await findClientById(client.id)) });
  }),
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const client = await findClientById(req.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ client: toPublicClient(client) });
  }),
);

export default router;
