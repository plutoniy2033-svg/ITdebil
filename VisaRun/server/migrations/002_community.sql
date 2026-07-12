CREATE TABLE IF NOT EXISTS companion_posts (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  route TEXT NOT NULL,
  post_date TEXT NOT NULL,
  seats_needed INTEGER NOT NULL DEFAULT 1,
  message TEXT NOT NULL,
  transport TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companion_posts_created_at
  ON companion_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS border_reports (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  checkpoint_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_border_reports_checkpoint_created
  ON border_reports(checkpoint_id, created_at DESC);
