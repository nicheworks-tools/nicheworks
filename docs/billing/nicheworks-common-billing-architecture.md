# NicheWorks Common Billing Architecture

## Status

The product-scoped common billing foundation is implemented far enough to serve as the forward billing engine:

- server-side Stripe Checkout Session creation: implemented;
- verified Stripe webhook processing: implemented;
- unpaid / delayed-payment fail-closed handling: implemented;
- D1 entitlement issue and lookup: implemented;
- product-scoped browser entitlement adapter: implemented;
- success-page server verification: implemented;
- multiple product registry entries supported;
- legacy shared `nicheworks_pro` tools: not yet migrated.

The architecture decision as of 2026-09-13 is that **product-scoped billing remains the engine, while `NicheWorks Pro` becomes one explicit shared bundle product for selected tools**.

The canonical future bundle product ID is:

- `nicheworks.pro`

This identifier is deliberately distinct from the legacy entitlement label `nicheworks_pro`.

## 1. Purpose

NicheWorks uses one reusable billing architecture for paid products while keeping server verification and entitlement scope explicit.

The same engine supports:

- one shared bundle product covering multiple selected tools;
- separate standalone products;
- one-time purchases;
- multiple product IDs;
- reusable price metadata;
- server-created Stripe Checkout Sessions;
- one verified webhook boundary;
- D1-backed entitlements;
- product/feature entitlement checks;
- conservative browser state.

**Product-scoped does not mean one product per tool.** A product may represent a bundle. Tools that belong to that bundle can verify the same product entitlement while retaining their own feature/operation mappings.

## 2. Product types

### 2.1 `nicheworks.pro`

`nicheworks.pro` is the future shared NicheWorks Pro bundle for selected professional/business/developer tools.

Commercial direction:

- billing model: one-time purchase;
- membership: selected tools only;
- access: one verified purchase may unlock all approved bundle members;
- price/currency: pending explicit decision;
- Stripe Product/Price: pending explicit configuration;
- registry entry: not added until price and Stripe mapping are confirmed.

Bundle membership must be explicit. Old Pro code does not automatically make a tool a bundle member.

### 2.2 Standalone products

Standalone products remain possible when the product is materially separate from the general NicheWorks Pro bundle.

Current planning entries include:

- `okj.toolkit_pro` — Old Kanji Toolkit Pro;
- `reconcile.pro_v1` — Reconcile Pro.

Both are currently `not_connected` in the registry and remain separate unless deliberately changed later.

A standalone product must not implicitly unlock `nicheworks.pro`, and the bundle must not implicitly unlock a standalone product.

### 2.3 Usage / credit products

Usage or credit billing is a future option only when a tool incurs meaningful per-use server/API/AI/OCR cost. It is not part of the current browser-local Pro rollout.

## 3. Product registry

Canonical registry:

- `config/billing/products.json`

Each registered paid product defines or resolves:

- stable `productId`;
- display name;
- price metadata;
- `priceTierId` or equivalent validated price contract;
- server environment-variable name containing the real Stripe Price ID;
- stable feature IDs;
- UI availability state.

Real Stripe Price IDs and secret keys are never committed to the repository.

The registry currently contains planning entries for Old Kanji Toolkit Pro and Reconcile Pro. `nicheworks.pro` must be added only after its real commercial configuration is decided.

## 4. Product vs price tier

`productId` is the billing entitlement boundary.

`priceTierId` is pricing metadata/validation, not entitlement identity.

Two products at the same price remain separate. Conversely, one product may unlock several tools if that multi-tool bundle is explicitly defined.

For the shared bundle:

- product boundary: `nicheworks.pro`;
- tool membership: explicit bundle ledger/contract;
- tool paid features: explicit per-tool feature mappings.

## 5. Checkout creation

Route:

- `POST /api/billing/create-checkout-session`

The route must:

1. load the product registry;
2. reject unknown/misconfigured products;
3. validate the product against its price contract;
4. resolve the Stripe Price ID from server environment only;
5. accept only a safe internal return path;
6. create the appropriate Stripe Checkout Session;
7. attach only validated billing metadata;
8. return the Checkout URL and non-secret session metadata.

Enablement is fail-closed. Generic runtime flags include:

- `BILLING_TEST_CHECKOUT_ENABLED`;
- `BILLING_LIVE_CHECKOUT_ENABLED`.

No frontend may fabricate a product ID, price, or Stripe Price ID.

## 6. Webhook and payment authority

Route:

- `POST /api/billing/stripe-webhook`

The webhook must:

- verify the Stripe signature against the raw body before parsing/fulfillment;
- validate product and price metadata against the registry;
- require a fulfillment-ready payment state;
- issue D1 entitlement idempotently by Checkout Session ID;
- support delayed-payment completion correctly;
- support later refund/revocation/dispute lifecycle handling.

Recognized fulfillment events include:

- `checkout.session.completed`;
- `checkout.session.async_payment_succeeded`.

A `checkout.session.completed` event with `payment_status=unpaid` must not issue paid access.

Redirect/success pages never substitute for webhook payment authority.

## 7. Entitlement storage

D1 binding:

- `BILLING_DB`

Forward table:

- `billing_entitlements`

Important fields include:

- entitlement ID;
- product ID;
- status;
- source;
- Stripe Checkout Session ID;
- Stripe customer/payment references required for billing lifecycle work;
- feature snapshot;
- timestamps/revocation state.

The Checkout Session ID is the current idempotency boundary.

Billing storage must never contain tool content such as command text, OCR text, uploaded documents, JSON payloads, names, addresses, municipality input, filenames or generated reports.

## 8. Bundle entitlement semantics

For a selected bundle member, access is determined from the verified `nicheworks.pro` product entitlement plus the tool's approved feature/operation mapping.

Example shape:

```text
verified product: nicheworks.pro
       |
       +-- Command Safety paid operations
       +-- Log Formatter paid operations
       +-- SQL DB Risk paid operations
       +-- UI Atlas paid operations
       +-- other explicitly approved bundle members
```

The exact membership list is maintained separately and must be decided from the canonical 87-tool specifications and monetization evidence.

A tool cannot join the bundle merely because it has a historical `pro-bridge.js`, `NWPro` reference, price label, or Payment Link.

## 9. Server entitlement check

Route:

- `GET /api/billing/entitlement?productId=...&sessionId=...`

Active access requires a D1 row matching at minimum:

- requested product ID;
- Checkout Session ID;
- `status=active`.

The response should be minimized to the fields needed by the client, such as product ID, active/state, configured features and entitlement ID. Customer/payment internals must remain server-side.

For bundle members, clients request `productId=nicheworks.pro` after the product is registered and live.

## 10. Browser adapter

Runtime:

- `assets/nw-pro-entitlement.js`

The adapter exposes conservative state reads and server refresh/activation helpers.

### Local state rule

`localStorage` is not entitlement authority.

After a server-confirmed active check, the adapter may retain only the product-scoped Checkout Session ID or similarly non-authoritative restore reference needed for later re-check. A new page lifecycle must not become active solely because a browser flag says so.

There is no future authoritative browser `active=true` purchase flag.

## 11. Feature scope

A product can be server-active while a requested tool feature remains locked.

Feature activation requires:

1. a server-active product entitlement; and
2. the requested feature/operation to be present in the approved mapping for that tool/product.

This allows one `nicheworks.pro` product to unlock different approved operations in different bundle-member tools without making every operation universally available.

## 12. Success / cancel pages

Checkout success handling carries only the validated identifiers needed for server verification and safe return.

`billing/success.html` must display active state only after server confirmation.

`billing/cancel.html` grants nothing.

Checkout Session IDs must not be emitted as GA4 event parameters.

## 13. Restore access

Current product-scoped restore convenience is browser/device scoped through a verified session reference and server re-check.

Before broad commercial launch, NicheWorks must decide how a legitimate purchaser restores access on another browser/device without reverting to local-only authority or exposing billing internals.

Possible future mechanisms include a safe license token, account, or verified email-based restore process, but no mechanism is approved merely by being listed here.

## 14. Security requirements

- never commit Stripe secret keys or webhook secrets;
- never expose real Stripe Price IDs in frontend code;
- verify webhook signatures;
- do not issue access for unpaid checkout;
- keep webhook fulfillment idempotent;
- do not trust URL state as entitlement proof;
- do not trust localStorage as entitlement proof;
- fail closed when product config, D1 or required server configuration is unavailable;
- do not log/store tool content in billing records;
- do not send checkout/session identifiers to analytics;
- preserve standalone product isolation;
- preserve explicit bundle membership and feature mappings.

## 15. Legacy shared Pro boundary

The repository also contains older infrastructure:

- `assets/nw-pro.js`;
- `/api/pro/status`;
- `/api/stripe/webhook`;
- `pro_purchases` / `pro_entitlements`;
- existing tools using `nicheworks_pro`;
- the historical shared Payment Link;
- old `/pro/unlock/` behavior.

This path is **legacy compatibility/migration input**. It is not the forward shared-bundle implementation.

Do not delete it until:

1. historical purchase records and access obligations are understood;
2. the new `nicheworks.pro` product exists;
3. target tools have migrated;
4. historical purchasers have an explicit migration/grandfather policy;
5. the new path has passed end-to-end payment and revocation tests.

## 16. Existing staged product-scoped controllers

Existing non-live staged controllers for Command Safety, Logistics, UI Atlas, Log Formatter, SQL DB Risk and other candidates remain useful.

They should not be discarded simply because the commercial model is now a shared bundle.

For tools eventually selected into `PRO_BUNDLE`, their controller can use the same future `nicheworks.pro` product ID while preserving a tool-specific operation-to-feature mapping.

For tools classified elsewhere, the staged controller must not be activated merely because it exists.

## 17. D1 authority transition

The repository currently has both legacy Pro storage and the newer billing entitlement store.

Forward authority should converge on `BILLING_DB` / `billing_entitlements`, but the old tables must not be removed until migration rules are explicit.

A later migration PR must define:

- legacy purchase inventory;
- mapping/grandfather rules;
- idempotent migration procedure;
- rollback/reconciliation checks;
- when legacy writes stop;
- when legacy reads stop;
- final retirement criteria.

## 18. Reference end-to-end proof

Before declaring NicheWorks Pro commercially live, prove at minimum:

1. checkout is created for the real registered `nicheworks.pro` product;
2. successful payment produces a signed webhook event;
3. D1 receives an active entitlement;
4. the success page verifies server state;
5. Command Safety Checker unlocks only its approved paid operations;
6. refresh/reload re-verifies successfully;
7. URL/localStorage tampering cannot self-unlock;
8. cancellation/unpaid checkout remains locked;
9. refund/revocation returns the tool to locked state;
10. a second approved bundle member recognizes the same purchase without another checkout.

The tenth check is what proves the bundle architecture rather than merely proving single-product billing.

## 19. Remaining work

1. classify all 87 registered tools by monetization type;
2. freeze the exact `PRO_BUNDLE` membership list;
3. freeze Free/Pro boundaries for bundle members;
4. decide `nicheworks.pro` price/currency and Stripe Product/Price;
5. add the real registry entry and environment-variable mapping;
6. verify/deploy the D1 schema and legacy migration plan;
7. perform the reference end-to-end test;
8. prove second-tool shared access;
9. migrate remaining bundle members in waves;
10. retire the legacy shared billing path after migration.

Do not infer commercial readiness from a visit to `/billing/success.html`, an old Pro page, a staged controller, or the presence of a historical Payment Link.
