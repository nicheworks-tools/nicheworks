# Server Entitlement Check API (OKJ-BILLING-LIVE-04)

## Endpoint

- `GET /api/billing/entitlement`

Query params:

- `productId=okj.toolkit_pro`
- `sessionId=cs_test_...` (or `cs_live_...`)

## Behavior

This API provides a minimal server-side restore/check boundary.

Validation rejects:

- missing `productId`
- unknown `productId`
- missing `sessionId`
- malformed `sessionId`

The API only supports `okj.toolkit_pro` for this phase.

## Entitlement proof model

`sessionId` in URL/query is **not proof of Pro access** by itself.

The server checks D1 (`BILLING_DB`) and only returns active when all conditions match:

- `stripe_checkout_session_id = sessionId`
- `product_id = productId`
- `status = active`

If no matching row exists, response is inactive (`restore-required`).

If D1 binding is missing, API fails closed:

```json
{
  "ok": false,
  "error": "entitlement_storage_not_configured"
}
```

## Response shape

Active example:

```json
{
  "ok": true,
  "productId": "okj.toolkit_pro",
  "active": true,
  "state": "pro-active",
  "source": "server",
  "features": ["okj.exportCsv"],
  "entitlementId": "ent_okj.toolkit_pro_..."
}
```

Inactive example:

```json
{
  "ok": true,
  "productId": "okj.toolkit_pro",
  "active": false,
  "state": "restore-required",
  "source": "server",
  "features": []
}
```

## Data minimization and security

Client response must not expose:

- Stripe customer ID
- Stripe payment intent ID
- raw checkout session internals
- webhook payload internals
- D1 raw row
- customer email or email hash

This phase does not add client-side unlock wiring:

- no localStorage unlock
- no URL-only unlock
- no client self-unlock

Future phases may replace session-based restore with account/email-based verified restore.
