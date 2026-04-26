-- 001_init.sql -- Initial schema. Verbatim from docs/work-plan.md Appendix A
-- plus pgcrypto for gen_random_uuid().

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');

CREATE TABLE campaigns (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL,
  status       campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_by   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user_status ON campaigns(created_by, status);
CREATE INDEX idx_campaigns_scheduled   ON campaigns(scheduled_at) WHERE status = 'scheduled';

CREATE TABLE recipients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE cr_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE campaign_recipients (
  campaign_id  UUID NOT NULL REFERENCES campaigns(id)  ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE RESTRICT,
  status       cr_status NOT NULL DEFAULT 'pending',
  sent_at      TIMESTAMPTZ,
  opened_at    TIMESTAMPTZ,
  PRIMARY KEY (campaign_id, recipient_id)
);

CREATE INDEX idx_cr_campaign_status ON campaign_recipients(campaign_id, status);
