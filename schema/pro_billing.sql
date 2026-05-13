-- NicheWorks Common Pro Billing D1 schema
-- Apply this to the Cloudflare D1 database bound as DB.

CREATE TABLE IF NOT EXISTS pro_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_event_id TEXT,
  customer_id TEXT,
  customer_email TEXT,
  payment_status TEXT NOT NULL,
  entitlement TEXT NOT NULL,
  source_tool TEXT,
  payment_link_id TEXT,
  price_id TEXT,
  amount_total INTEGER,
  currency TEXT,
  raw_created INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pro_entitlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_email TEXT NOT NULL,
  entitlement TEXT NOT NULL,
  status TEXT NOT NULL,
  source TEXT,
  stripe_session_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(customer_email, entitlement)
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pro_access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_email TEXT,
  entitlement TEXT,
  tool_id TEXT,
  status TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pro_purchases_email ON pro_purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_pro_purchases_session ON pro_purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_pro_entitlements_email ON pro_entitlements(customer_email);
CREATE INDEX IF NOT EXISTS idx_pro_entitlements_status ON pro_entitlements(status);
