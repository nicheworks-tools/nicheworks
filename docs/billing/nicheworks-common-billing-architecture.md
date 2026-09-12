# NicheWorks Common Billing Architecture

## Status

The product-scoped common billing foundation is now partially implemented:

- server-side Stripe Checkout Session creation: implemented;
- verified Stripe webhook processing: implemented;
- D1 entitlement issue and lookup: implemented;
- product-scoped browser entitlement adapter: implemented;
- success-page server verification: implemented;
- additional NicheWorks products: not added until each product has verified pricing and Stripe configuration;
- legacy shared `nicheworks_pro` tools: not migrated by this foundation change.

The initial configured product remains **Old Kanji Toolkit Pro** (`okj.toolkit_pro`).

## 1. Purpose

NicheWorks uses one reusable billing architecture for small paid products while keeping entitlement scope product-specific.

The foundation supports:

- one-time purchases;
- multiple product IDs;
- reusable price tiers;
- server-created Stripe Checkout Sessions;
- one verified webhook path;
- D1-backed entitlements;
- product/feature entitlement checks;
- conservative browser Pro state.

**Common billing foundation does not mean common all-access unlock.** Two products at the same price remain separate unless a future explicit bundle product is defined.

## 2. Product registry

Canonical registry:

- `config/billing/products.json`

Each product defines:

- stable `productId`;
- display name;
- one-time price metadata;
- `priceTierId`;
- environment-variable name containing the real Stripe Price ID;
- stable feature IDs.

Real Stripe Price IDs and secret keys are never committed to the repository.

Current product:

- Product ID: `okj.toolkit_pro`
- Display product: Old Kanji Toolkit Pro
- Price tier: `nw.one_time.usd_499`
- Price: `$4.99` one-time
- Stripe Price env: `STRIPE_PRICE_OKJ_TOOLKIT_PRO`

The existing OKJ price/features are preserved by the common-foundation hardening work.

## 3. Product vs price tier

`productId` is the entitlement boundary.

`priceTierId` is reusable pricing metadata and validation only.

A future product can use the same `$4.99` tier without receiving `okj.toolkit_pro` access. Cross-product access requires an explicit bundle/all-access product and policy.

## 4. Checkout creation

Route:

- `POST /api/billing/create-checkout-session`

The route:

1. loads the product registry;
2. rejects unknown/misconfigured products;
3. validates the product against its referenced price tier;
4. resolves the product's Stripe Price ID from server environment only;
5. accepts only a safe internal return path;
6. creates a one-time Stripe Checkout Session;
7. attaches only product/price-tier metadata;
8. returns the Checkout URL and non-secret session metadata.

Enablement is fail-closed. Generic runtime flags are:

- `BILLING_TEST_CHECKOUT_ENABLED`
- `BILLING_LIVE_CHECKOUT_ENABLED`

The existing OKJ-specific enable flags remain accepted as backward-compatible aliases for the current OKJ product.

## 5. Webhook and payment authority

Route:

- `POST /api/billing/stripe-webhook`

The webhook:

- verifies the Stripe signature against the raw body before parsing/fulfillment;
- validates product + price tier metadata against the registry;
- requires a fulfillment-ready payment state;
- issues a D1 entitlement idempotently by Checkout Session ID.

Recognized fulfillment events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

A `checkout.session.completed` event with `payment_status=unpaid` does **not** issue paid access. Delayed payment methods can issue access after the corresponding async success event.

Redirect pages never substitute for webhook payment authority.

## 6. Entitlement storage

D1 binding:

- `BILLING_DB`

Table:

- `billing_entitlements`

Important fields include:

- entitlement ID;
- product ID;
- status;
- source;
- Stripe Checkout Session ID;
- Stripe customer/payment references needed for billing lifecycle work;
- feature snapshot;
- timestamps/revocation state.

The Checkout Session ID is unique and is the current idempotency boundary.

Billing storage must not contain OCR text, command text, names/addresses, uploaded documents, JSON payloads or other tool content.

## 7. Server entitlement check

Route:

- `GET /api/billing/entitlement?productId=...&sessionId=...`

Active access requires a D1 row matching:

- product ID;
- Checkout Session ID;
- `status=active`.

The response is deliberately minimized. It can return product ID, active/state, configured features and entitlement ID, but not customer/payment internals.

## 8. Browser adapter

Runtime:

- `assets/nw-pro-entitlement.js`

The adapter exposes:

- sync conservative state reads (`getProState`, `getProductState`, `getFeatureState`);
- async server refresh (`refreshProState`);
- checkout-session activation (`activateFromSession`);
- product-session clearing (`clearProductSession`).

### Local state rule

`localStorage` is not entitlement authority.

After a server-confirmed active check, the adapter may remember only the product-scoped Checkout Session ID so it can re-check on a later page load. A new page lifecycle starts inactive/pending until the server confirms the D1 entitlement again.

There is no authoritative browser `active=true` flag in this adapter.

## 9. Feature scope

A product can be server-active while a requested feature remains locked.

Feature activation requires:

1. server-active product entitlement; and
2. the requested feature ID to appear in the server-returned configured feature list.

This prevents a product entitlement from automatically unlocking unrelated product features.

## 10. Success / cancel pages

Checkout success URL carries:

- `product_id`;
- `session_id` supplied by Stripe through `{CHECKOUT_SESSION_ID}`;
- validated `return_path`.

`billing/success.html` asks the server adapter to verify the entitlement and only displays an active state after server confirmation.

`billing/cancel.html` grants nothing and only offers a safe return path.

Checkout Session IDs must not be emitted as GA4 event parameters.

## 11. Restore access

Current restore convenience is browser/device scoped: a verified Checkout Session ID can be retained locally and re-checked against D1.

This is not a complete cross-device identity system. Future restore options can include a safe license-token, account, or email-based mechanism, but must not expose raw customer billing data or revert to local-only access authority.

## 12. Security requirements

- never commit Stripe secret keys or webhook secrets;
- never expose real Stripe Price IDs in frontend code;
- verify webhook signatures;
- do not issue paid access for an unpaid Checkout Session;
- keep webhook handling idempotent;
- do not trust URL state as entitlement proof;
- do not trust localStorage as entitlement proof;
- fail closed when product config, D1 or required server configuration is unavailable;
- do not log/store tool content in billing records;
- preserve product-specific entitlement scope.

## 13. Legacy shared Pro boundary

The repository also contains older infrastructure:

- `assets/nw-pro.js`
- `/api/pro/status`
- `/api/stripe/webhook`
- `pro_purchases` / `pro_entitlements`
- existing tools using `nicheworks_pro` and a shared Payment Link.

That path is **legacy and separate** from the newer product-scoped foundation in this slice. It is not silently removed because existing tools may still depend on it.

Migration of Command Safety Checker, Logistics Compliance Kit JP, JSON2Mermaid or any other product must happen product-by-product after its product ID, price, Stripe Price environment variable and free/paid contract are verified.

## 14. Initial OKJ feature scope

`okj.toolkit_pro` currently defines the existing OKJ feature IDs in the product registry, including OCR batch/history, export/report, name/place/text batch operations, saved compare sets, Unicode audit export and quiz history.

This architecture does not itself implement those tool features; it only supplies the verified entitlement foundation they can use.

## 15. Remaining work

Before declaring a specific product commercially live:

1. confirm its product registry entry and price;
2. configure the corresponding Stripe Price environment value;
3. configure Stripe secret/webhook/D1 bindings;
4. register the webhook endpoint;
5. run a real test-mode Checkout → webhook → D1 → entitlement → tool-gate flow;
6. verify cancellation, unpaid/delayed payment and duplicate webhook cases;
7. then enable that product's UI checkout path.

Do not infer commercial readiness from visits to `/billing/success.html` or a tool's `/pro` page.
