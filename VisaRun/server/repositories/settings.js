import { query } from '../db.js';

export const DEFAULT_SETTINGS = {
  reminders: { days14: true, days7: true, days3: true, days1: true },
  notificationTime: '10:00',
  criticalAlerts: false,
  currency: 'USD',
  offlineCache: false,
  biometricsEnabled: false,
  partnerMode: false,
  partnerRoute: 'Ho Chi Minh — Moc Bai',
  partnerTariff: '',
  documentCacheSize: 0,
};

function mapSettings(row) {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    reminders: row.reminders,
    notificationTime: row.notification_time,
    criticalAlerts: row.critical_alerts,
    currency: row.currency,
    offlineCache: row.offline_cache,
    biometricsEnabled: row.biometrics_enabled,
    partnerMode: row.partner_mode,
    partnerRoute: row.partner_route,
    partnerTariff: row.partner_tariff,
    documentCacheSize: 0,
  };
}

export async function getSettingsByClientId(clientId) {
  const result = await query('SELECT * FROM user_settings WHERE client_id = $1', [clientId]);
  return mapSettings(result.rows[0]);
}

export async function upsertSettings(clientId, settings) {
  await query(
    `INSERT INTO user_settings (
      client_id,
      reminders,
      notification_time,
      critical_alerts,
      currency,
      offline_cache,
      biometrics_enabled,
      partner_mode,
      partner_route,
      partner_tariff,
      updated_at
    ) VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    ON CONFLICT (client_id) DO UPDATE SET
      reminders = EXCLUDED.reminders,
      notification_time = EXCLUDED.notification_time,
      critical_alerts = EXCLUDED.critical_alerts,
      currency = EXCLUDED.currency,
      offline_cache = EXCLUDED.offline_cache,
      biometrics_enabled = EXCLUDED.biometrics_enabled,
      partner_mode = EXCLUDED.partner_mode,
      partner_route = EXCLUDED.partner_route,
      partner_tariff = EXCLUDED.partner_tariff,
      updated_at = NOW()`,
    [
      clientId,
      JSON.stringify(settings.reminders),
      settings.notificationTime,
      settings.criticalAlerts,
      settings.currency,
      settings.offlineCache,
      settings.biometricsEnabled,
      settings.partnerMode,
      settings.partnerRoute,
      settings.partnerTariff,
    ],
  );
}

export async function ensureDefaultSettings(clientId) {
  await query(
    `INSERT INTO user_settings (client_id)
     VALUES ($1)
     ON CONFLICT (client_id) DO NOTHING`,
    [clientId],
  );
}
