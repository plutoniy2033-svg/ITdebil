import { Router } from 'express';
import { randomUUID } from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  addVisaRunRecord,
  deleteVisaRunRecord,
  getTrackerByClientId,
  replaceTrackerState,
  upsertTrackerProfile,
} from '../repositories/tracker.js';
import { validateHistoryRecord, validateTrackerPayload } from '../utils/validation.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const tracker = await getTrackerByClientId(req.clientId);
    res.json({ tracker });
  }),
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const tracker = validateTrackerPayload(req.body);
    await replaceTrackerState(req.clientId, tracker);
    res.json({ tracker: await getTrackerByClientId(req.clientId) });
  }),
);

router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const current = await getTrackerByClientId(req.clientId);
    const merged = validateTrackerPayload({ ...current, ...req.body, visaRunHistory: current.visaRunHistory });
    await upsertTrackerProfile(req.clientId, merged);
    res.json({ tracker: await getTrackerByClientId(req.clientId) });
  }),
);

router.post(
  '/history',
  asyncHandler(async (req, res) => {
    const record = validateHistoryRecord(req.body);
    const id = record.id ?? randomUUID();
    await addVisaRunRecord(req.clientId, { ...record, id });
    res.status(201).json({ tracker: await getTrackerByClientId(req.clientId) });
  }),
);

router.delete(
  '/history/:recordId',
  asyncHandler(async (req, res) => {
    const deleted = await deleteVisaRunRecord(req.clientId, req.params.recordId);
    if (!deleted) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ tracker: await getTrackerByClientId(req.clientId) });
  }),
);

export default router;
