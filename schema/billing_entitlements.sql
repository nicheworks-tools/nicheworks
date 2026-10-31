-- Cloudflare D1 migration for BILLING_DB. Apply before enabling paid sales.
-- Billing metadata only: never store OCR, names, documents, addresses, filenames, images or raw email.
CREATE TABLE IF NOT EXISTS billing_entitlements (
  entitlement_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','revoked','refunded','disputed','test','unknown')),
  source TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  customer_email_hash TEXT,
  features_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_billing_entitlements_product_status ON billing_entitlements(product_id,status);
CREATE INDEX IF NOT EXISTS idx_billing_entitlements_payment_intent ON billing_entitlements(stripe_payment_intent_id);
