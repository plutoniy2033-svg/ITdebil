import { Router } from 'express';
import { randomUUID } from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { findClientById } from '../repositories/clients.js';
import {
  createBorderReport,
  createCompanionPost,
  listBorderReports,
  listCompanionPosts,
} from '../repositories/community.js';
import {
  validateBorderReportPayload,
  validateCompanionPostPayload,
} from '../utils/validation.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/companions',
  asyncHandler(async (_req, res) => {
    const posts = await listCompanionPosts();
    res.json({ posts });
  }),
);

router.post(
  '/companions',
  asyncHandler(async (req, res) => {
    const client = await findClientById(req.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const payload = validateCompanionPostPayload(req.body);
    const id = randomUUID();

    await createCompanionPost({
      id,
      clientId: req.clientId,
      authorName: client.full_name,
      route: payload.route,
      postDate: payload.date,
      seatsNeeded: payload.seatsNeeded,
      message: payload.message,
      transport: payload.transport,
    });

    const posts = await listCompanionPosts();
    res.status(201).json({ posts });
  }),
);

router.get(
  '/border',
  asyncHandler(async (req, res) => {
    const checkpointId = String(req.query.checkpointId ?? 'moc-bai');
    const reports = await listBorderReports(checkpointId);
    res.json({ reports });
  }),
);

router.post(
  '/border',
  asyncHandler(async (req, res) => {
    const client = await findClientById(req.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const payload = validateBorderReportPayload(req.body);
    const id = randomUUID();

    await createBorderReport({
      id,
      clientId: req.clientId,
      checkpointId: payload.checkpointId,
      authorName: client.full_name,
      message: payload.message,
    });

    const reports = await listBorderReports(payload.checkpointId);
    res.status(201).json({ reports });
  }),
);

export default router;
