# Stripe Webhook Verification and D1 Entitlement Issue

## Status

Runtime posture:

- Stripe signature verification enabled.
- Product registry validation enabled.
- D1 entitlement issue enabled.
- Checkout-session idempotency enabled.
- Delayed-payment fulfillment handled conservatively.

## Route

- `POST /api/billing/stripe-webhook`

Required runtime configuration:

- `STRIPE_WEBHOOK_SECRET`
- `BILLING_DB`
- product registry available through site assets

## Signature verification

The handler reads the raw request body, verifies `Stripe-Signature` using HMAC SHA-256 and a 300-second timestamp tolerance, and parses JSON only after verification succeeds.

Unverified input never reaches entitlement issue.

## Accepted fulfillment events

Entitlement fulfillment recognizes:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Other event types are acknowledged and ignored by this route.

### Payment-state rule

A completed Checkout Session does **not** automatically mean an entitlement is active.

Before entitlement issue, the Checkout Session must have a payment state accepted for fulfillment:

- `paid`, or
- `no_payment_required` for a legitimately configured product that can produce that Stripe state.

If `checkout.session.completed` arrives with `payment_status=unpaid`, the handler acknowledges the verified event with `entitlementIssued=false` and does not create an active entitlement.

For delayed payment methods, Stripe can later send `checkout.session.async_payment_succeeded`; that event passes through the same product/payment checks and can issue the entitlement idempotently.

## Product validation

The webhook requires metadata:

- `productId`
- `priceTierId`

It loads `config/billing/products.json` and requires:

- the product exists;
- the referenced price tier exists;
- product price metadata and price-tier metadata are internally consistent;
- metadata `priceTierId` matches the selected product;
- Checkout currency, when supplied, matches the configured product currency.

The product ID is the entitlement boundary. A reusable price tier never implies cross-product unlock.

## D1 entitlement issue

D1 binding:

- `BILLING_DB`

Idempotency boundary:

- `stripe_checkout_session_id`

Stored entitlement state includes the product ID, feature snapshot, Stripe Checkout Session ID, payment/customer references needed for billing reconciliation, timestamps and status. Tool input is never stored with billing records.

Duplicate fulfillment for the same Checkout Session returns the existing entitlement instead of creating a second row.

## Failure posture

The route fails closed when:

- webhook secret is missing;
- Stripe signature is missing/invalid/stale;
- verified payload is malformed;
- product metadata is missing/unknown/inconsistent;
- D1 is unavailable;
- Checkout Session ID is malformed;
- payment state is not fulfilled.

## Client boundary

The webhook does not directly unlock browser UI. Client access is enabled only after the server entitlement API returns active for the same product + Checkout Session record.
