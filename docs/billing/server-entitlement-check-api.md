# Server Entitlement Check API

## Endpoint

- `GET /api/billing/entitlement`

Query parameters:

- `productId=<configured product id>`
- `sessionId=cs_test_...` or `cs_live_...`

`okj.toolkit_pro` is currently the only configured product, but the endpoint itself is registry-driven and no longer hardcodes that product ID.

## Validation

The endpoint:

1. loads `config/billing/products.json`;
2. requires `productId` to identify a valid configured product whose price metadata matches its price tier;
3. requires a well-formed Stripe Checkout Session ID;
4. queries D1 `BILLING_DB` for an active entitlement matching both product and session;
5. intersects the stored feature snapshot with the product's currently configured feature list before returning it.

Unknown products, malformed sessions and unavailable storage fail closed.

## Entitlement proof model

Neither `productId` nor `sessionId` is sufficient by itself.

Active access requires a D1 row where:

- `stripe_checkout_session_id = sessionId`
- `product_id = productId`
- `status = active`

An absent row returns an inactive `restore-required` state.

## Active response

```json
{
  "ok": true,
  "productId": "okj.toolkit_pro",
  "active": true,
  "state": "pro-active",
  "source": "server",
  "features": ["okj.exportCsv"],
  "entitlementId": "ent_..."
}
```

## Inactive response

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

## Data minimization

The client response does not expose:

- Stripe customer ID;
- Stripe payment intent ID;
- raw Checkout Session internals;
- webhook payload;
- D1 raw row;
- customer email/hash;
- tool content.

The browser entitlement adapter may remember a verified product-scoped Checkout Session ID only as a restore/check convenience. It must re-check the server in a new page lifecycle and must not store an authoritative `active=true` flag.
