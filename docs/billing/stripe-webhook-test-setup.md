# Stripe Webhook Test Setup (LIVE-02)

## Purpose
This document explains how to test webhook signature verification for:
- `POST /api/billing/stripe-webhook`

This phase verifies authenticity and payload checks only.
It does **not** issue entitlements and does **not** unlock Pro.

## Required environment variable
Set server-side secret:
- `STRIPE_WEBHOOK_SECRET`

Notes:
- Do not expose this secret to client-side code.
- Do not commit real secrets to the repository.

## Stripe dashboard setup (test mode)
1. Open Stripe Dashboard in **test mode**.
2. Go to **Developers → Webhooks**.
3. Add endpoint:
   - `https://<your-domain>/api/billing/stripe-webhook`
4. Select event to send:
   - `checkout.session.completed`
5. Save endpoint and copy signing secret (`whsec_...`).
6. Set the copied value into server env as `STRIPE_WEBHOOK_SECRET`.

## Raw body and signature requirements
The webhook requires:
- raw request body read as text (`request.text()`)
- `Stripe-Signature` header with format including:
  - `t=<timestamp>`
  - `v1=<signature>`

The handler verifies HMAC SHA-256 over:
- `${timestamp}.${rawBody}`

If signature is missing/invalid, request is rejected.

## Expected API responses
- Missing secret:
  - `{ "ok": false, "error": "webhook_secret_missing" }`
- Missing signature:
  - `{ "ok": false, "error": "webhook_signature_missing" }`
- Invalid signature:
  - `{ "ok": false, "error": "webhook_signature_invalid" }`
- Invalid payload JSON/shape:
  - `{ "ok": false, "error": "webhook_payload_invalid" }`

For verified non-target events:
- `{ "ok": true, "verified": true, "received": true, "ignored": true, ... }`

For verified `checkout.session.completed` with expected metadata:
- `{ "ok": true, "verified": true, "received": true, "eventType": "checkout.session.completed", "productId": "okj.toolkit_pro", "entitlementIssued": false }`

## Stripe CLI example (optional)
You may use Stripe CLI to forward test events:
1. `stripe listen --forward-to http://localhost:8788/api/billing/stripe-webhook`
2. Set `STRIPE_WEBHOOK_SECRET` to the secret shown by Stripe CLI for that listener.
3. Trigger event:
   - `stripe trigger checkout.session.completed`

## Important limitation in LIVE-02
Even for valid verified events:
- entitlement is not issued
- D1/KV is not written
- OKJ Pro unlock is not activated

Next phase will implement storage-backed entitlement issuing.
