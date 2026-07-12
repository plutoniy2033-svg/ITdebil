import { config } from '../config.js';

const ALLOWED_DAY_LIMITS = new Set([30, 45, 90]);
const ALLOWED_CITIZENSHIPS = new Set(['RU', 'DE', 'KZ']);
const ALLOWED_ENTRY_TYPES = new Set(['visa-free', 'e-visa']);
const ALLOWED_CURRENCIES = new Set(['VND', 'USD', 'RUB']);

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateTrackerPayload(body) {
  const dayLimit = Number(body.dayLimit);
  if (!ALLOWED_DAY_LIMITS.has(dayLimit)) {
    throw validationError('Invalid dayLimit');
  }
  if (!ALLOWED_CITIZENSHIPS.has(body.citizenship)) {
    throw validationError('Invalid citizenship');
  }
  if (!ALLOWED_ENTRY_TYPES.has(body.entryType)) {
    throw validationError('Invalid entryType');
  }
  if (typeof body.location !== 'string' || body.location.trim().length < 2) {
    throw validationError('Invalid location');
  }

  const entryDate = normalizeOptionalDate(body.entryDate);
  const exitDate = normalizeOptionalDate(body.exitDate);
  if (entryDate && exitDate && exitDate < entryDate) {
    throw validationError('Exit date cannot be before entry date');
  }

  const visaRunHistory = Array.isArray(body.visaRunHistory) ? body.visaRunHistory : [];
  for (const record of visaRunHistory) {
    validateHistoryRecord(record);
  }

  return {
    entryDate: entryDate ?? '',
    exitDate: exitDate ?? '',
    dayLimit,
    location: body.location.trim(),
    citizenship: body.citizenship,
    entryType: body.entryType,
    visaRunHistory: visaRunHistory.map((record) => ({
      id: String(record.id),
      entryDate: normalizeRequiredDate(record.entryDate),
      checkpoint: String(record.checkpoint ?? '').trim(),
      entryType: record.entryType,
      exitDate: normalizeOptionalDate(record.exitDate) ?? undefined,
    })),
  };
}

export function validateHistoryRecord(body) {
  if (!ALLOWED_ENTRY_TYPES.has(body.entryType)) {
    throw validationError('Invalid entryType');
  }
  const entryDate = normalizeRequiredDate(body.entryDate);
  const exitDate = normalizeOptionalDate(body.exitDate);
  const checkpoint = String(body.checkpoint ?? '').trim();

  if (!checkpoint) {
    throw validationError('Checkpoint is required');
  }
  if (exitDate && exitDate < entryDate) {
    throw validationError('Exit date cannot be before entry date');
  }

  return {
    id: body.id ? String(body.id) : undefined,
    entryDate,
    checkpoint,
    entryType: body.entryType,
    exitDate: exitDate ?? undefined,
  };
}

export function validateSettingsPayload(body) {
  const reminders = body.reminders ?? {};
  const validatedReminders = {
    days14: Boolean(reminders.days14),
    days7: Boolean(reminders.days7),
    days3: Boolean(reminders.days3),
    days1: Boolean(reminders.days1),
  };

  const notificationTime = String(body.notificationTime ?? '10:00');
  if (!/^\d{2}:\d{2}$/.test(notificationTime)) {
    throw validationError('Invalid notificationTime');
  }

  const currency = body.currency ?? 'USD';
  if (!ALLOWED_CURRENCIES.has(currency)) {
    throw validationError('Invalid currency');
  }

  return {
    reminders: validatedReminders,
    notificationTime,
    criticalAlerts: Boolean(body.criticalAlerts),
    currency,
    offlineCache: Boolean(body.offlineCache),
    biometricsEnabled: Boolean(body.biometricsEnabled),
    partnerMode: Boolean(body.partnerMode),
    partnerRoute: String(body.partnerRoute ?? '').trim() || 'Ho Chi Minh — Moc Bai',
    partnerTariff: String(body.partnerTariff ?? '').trim(),
    documentCacheSize: 0,
  };
}

function normalizeOptionalDate(value) {
  if (!value) return null;
  const normalized = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw validationError('Invalid date format');
  }
  return normalized;
}

function normalizeRequiredDate(value) {
  const normalized = normalizeOptionalDate(value);
  if (!normalized) {
    throw validationError('Date is required');
  }
  return normalized;
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export function getCorsOptions() {
  return {
    origin: config.corsOrigin,
    credentials: true,
  };
}

export function validateCompanionPostPayload(body) {
  const route = String(body.route ?? '').trim();
  const message = String(body.message ?? '').trim();
  const transport = String(body.transport ?? '').trim() || 'Not specified';
  const date = String(body.date ?? '').trim() || 'Soon';
  const seatsNeeded = Number(body.seatsNeeded ?? 1);

  if (route.length < 3) {
    throw validationError('Route is required');
  }
  if (message.length < 8) {
    throw validationError('Message must be at least 8 characters');
  }
  if (!Number.isInteger(seatsNeeded) || seatsNeeded < 1 || seatsNeeded > 10) {
    throw validationError('Invalid seatsNeeded');
  }

  return { route, message, transport, date, seatsNeeded };
}

export function validateBorderReportPayload(body) {
  const checkpointId = String(body.checkpointId ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!checkpointId) {
    throw validationError('Checkpoint is required');
  }
  if (message.length < 8) {
    throw validationError('Message must be at least 8 characters');
  }

  return { checkpointId, message };
}
