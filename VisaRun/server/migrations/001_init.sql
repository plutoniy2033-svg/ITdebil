CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tracker_profiles (
  client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  entry_date DATE,
  exit_date DATE,
  day_limit INTEGER NOT NULL DEFAULT 45,
  location TEXT NOT NULL DEFAULT 'Vietnam',
  citizenship TEXT NOT NULL DEFAULT 'RU',
  entry_type TEXT NOT NULL DEFAULT 'visa-free',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visa_run_records (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  checkpoint TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  exit_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visa_run_records_client_id
  ON visa_run_records(client_id);

CREATE TABLE IF NOT EXISTS user_settings (
  client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  reminders JSONB NOT NULL DEFAULT '{"days14": true, "days7": true, "days3": true, "days1": true}'::jsonb,
  notification_time TEXT NOT NULL DEFAULT '10:00',
  critical_alerts BOOLEAN NOT NULL DEFAULT FALSE,
  currency TEXT NOT NULL DEFAULT 'USD',
  offline_cache BOOLEAN NOT NULL DEFAULT FALSE,
  biometrics_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  partner_mode BOOLEAN NOT NULL DEFAULT FALSE,
  partner_route TEXT NOT NULL DEFAULT 'Ho Chi Minh — Moc Bai',
  partner_tariff TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
