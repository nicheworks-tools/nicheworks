# D1 Entitlement Storage (LIVE-03)

## Required binding
Cloudflare Pages Functions must provide a D1 binding named:

- `BILLING_DB`

If this binding is missing, webhook entitlement issue fails closed with:

```json
{
  "ok": false,
  "error": "entitlement_storage_not_configured"
}
```

## D1 schema
Create the entitlement table in D1:

```sql
CREATE TABLE IF NOT EXISTS billing_entitlements (
  entitlement_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL,
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
```

Notes:
- `stripe_checkout_session_id` has a unique constraint and is the idempotency boundary for entitlement issue.
- `features_json` stores the product feature list snapshot at issue time.

## Privacy constraints
This table must **not** store:
- OCR text
- user document content
- image binaries
- raw customer email

LIVE-03 stores `customer_email_hash` as `NULL` by default (no raw email persistence).

## Dashboard/wrangler verification (optional)
You can validate this in Cloudflare D1 dashboard SQL editor by:
1. Running `CREATE TABLE` SQL above.
2. Sending a verified Stripe webhook event.
3. Confirming a single row appears for each unique `stripe_checkout_session_id`.
4. Replaying the same event and confirming no duplicate row is created.

If using Wrangler later, run equivalent SQL migration through your normal D1 migration workflow.
