import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getSettingsByClientId, upsertSettings } from '../repositories/settings.js';
import { validateSettingsPayload } from '../utils/validation.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const settings = await getSettingsByClientId(req.clientId);
    res.json({ settings });
  }),
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const settings = validateSettingsPayload(req.body);
    await upsertSettings(req.clientId, settings);
    res.json({ settings: await getSettingsByClientId(req.clientId) });
  }),
);

router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const current = await getSettingsByClientId(req.clientId);
    const settings = validateSettingsPayload({ ...current, ...req.body });
    await upsertSettings(req.clientId, settings);
    res.json({ settings: await getSettingsByClientId(req.clientId) });
  }),
);

export default router;
