# Pro Entitlement State Adapter Contract

## Status

The browser adapter now supports a **server-verified product entitlement** while preserving a conservative inactive default.

Runtime source:

- `assets/nw-pro-entitlement.js`
- server check: `GET /api/billing/entitlement`

The adapter is product-scoped. It does not define a site-wide all-access entitlement.

## Interface

Synchronous state reads:

- `getProState({ productId, featureId? })`
- `getFeatureState({ productId, featureId })`
- `getProductState({ productId })`

Async verification:

- `refreshProState({ productId, featureId?, sessionId? })`
- `activateFromSession({ productId, featureId?, sessionId })`
- `clearProductSession(productId)`

## State model

Possible states include:

- `restore-required`
- `checkout-pending`
- `free`
- `pro-active`
- `entitlement-error`

A new page lifecycle starts inactive. A product can become active only after the async server check returns an active entitlement.

## Source of truth

Authoritative paid state:

- Stripe webhook verification + D1 entitlement record + server entitlement API.

Not authoritative:

- URL parameter alone;
- `localStorage` boolean;
- client-side feature flags;
- Checkout success page text.

## Local storage rule

The adapter may store only a product-scoped Checkout Session ID after the server has confirmed that session as active.

Example key shape:

- `nicheworks:billing:session:okj.toolkit_pro`

This stored identifier is only a restore convenience. On a later page load the adapter returns an inactive/pending state until it re-checks the server. There is no persisted `active=true` authority in this adapter.

Manually editing the stored session value cannot create an entitlement because the server must find a matching active D1 row for the same product.

## Feature checks

A server-active product entitlement returns a minimized feature list. Feature state becomes active only when:

1. the product entitlement is server-active; and
2. the requested feature ID appears in the returned configured feature list.

A valid product entitlement does not automatically unlock a feature belonging to another product.

## Privacy

Entitlement requests contain only:

- product ID;
- Stripe Checkout Session ID.

They do not contain OCR content, command text, filenames, names, addresses, JSON input, logistics notes or other tool payloads.

## Failure behavior

If the server cannot be reached, product config is unavailable, D1 is unavailable, the session is invalid, or no matching entitlement exists, the adapter remains inactive.

The free tool contract must remain usable independently of entitlement failures.

## Migration note

`assets/nw-pro.js` and legacy `/api/pro/status` remain separate legacy infrastructure in this slice. Existing legacy Pro tools are not silently switched to the new product-scoped adapter until each tool has a verified product ID, price configuration and migration plan.
