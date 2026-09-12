# ExecPlan — Common billing foundation hardening and product-generalization

## 1. Goal

Turn the newer `/api/billing/*` Stripe + D1 path into the canonical reusable billing foundation for product-scoped NicheWorks Pro entitlements, without activating or modifying ManualFinder.

This slice must fix the currently unsafe fulfillment assumption in the webhook, remove the hardcoded `okj.toolkit_pro` limitation from the reusable server APIs, and connect the existing client entitlement adapter to server-verified product entitlements without making `localStorage` an authority.

The existing OKJ product remains the only configured product unless a separate implementation provides verified pricing / Stripe price environment configuration for another product. This PR must not guess a price or fabricate a new Stripe product.

## 2. Scope

In scope:

- `.agent/plans/2026-09-12-common-billing-foundation.md`
- `functions/api/billing/create-checkout-session.js`
- `functions/api/billing/stripe-webhook.js`
- `functions/api/billing/entitlement.js`
- `assets/nw-pro-entitlement.js`
- `billing/success.html`
- billing documentation directly describing the changed runtime contract
- a repository check script for the billing contract if useful

Potentially in scope only when required by the above contract:

- `billing/cancel.html` for a validated return path
- `config/billing/products.json` metadata status/copy, but not prices or additional products unless already verified

Explicitly out of scope:

- `tools/manual-finder/**`
- the legacy `/api/pro/status` and `/api/stripe/webhook` migration/removal in this slice
- `assets/nw-pro.js` legacy helper in this slice
- Command Safety Checker product migration/price choice
- Logistics Compliance Kit JP product migration/price choice
- JSON2Mermaid product migration/price choice
- Old Kanji Pro feature implementation beyond entitlement wiring
- `common-spec/**`
- site-wide navigation
- affiliate implementation
- secrets, Stripe price IDs, D1 credentials, or Cloudflare dashboard changes

## 3. Rules / Prohibitions

- Do not trust checkout success redirects as payment proof.
- Do not issue an active entitlement from `checkout.session.completed` when `payment_status` is unpaid.
- Support Stripe delayed payment completion through `checkout.session.async_payment_succeeded` or fail closed.
- Do not trust URL params or `localStorage` as paid entitlement proof.
- `localStorage` may hold only a product-scoped checkout session identifier for restore/check convenience; active state must come from a server entitlement check in the current page lifecycle.
- Do not store or send tool input, OCR text, command text, names, addresses, documents, or other user content to billing APIs.
- Do not expose Stripe customer/payment IDs in client entitlement responses.
- Do not fabricate product pricing, price IDs, partner IDs, or successful production configuration.
- Preserve the existing OKJ product ID, feature IDs, tier and price configuration.
- Keep APIs fail-closed if product config, D1 binding, webhook secret, or Stripe configuration is unavailable.
- Preserve idempotency by checkout session ID.

## 4. Change List

### `create-checkout-session.js`

- Replace the OKJ-only hardcoded shape guard with generic validation against `config/billing/products.json` and the referenced price tier.
- Resolve Stripe price env var from the selected product config.
- Keep existing safe relative `returnPath` validation.
- Put `product_id` and validated `return_path` on success/cancel URLs so the client can verify the correct product and return to the correct tool.
- Keep test/live enablement fail-closed; accept generic billing enable flags while retaining current OKJ flags as backward-compatible aliases for the existing OKJ product.

### `stripe-webhook.js`

- Continue signature verification before parsing/fulfillment.
- Process both `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
- On `checkout.session.completed`, issue only when `payment_status` is `paid` (or `no_payment_required` if a future zero-cost configured product legitimately uses that state); otherwise acknowledge as payment pending without entitlement issue.
- On async success, issue idempotently using the same checkout session boundary.
- Ignore unrelated events safely.
- Keep product/tier metadata validation and D1 idempotency.

### `entitlement.js`

- Validate `productId` against the live product registry instead of a hardcoded OKJ constant.
- Continue requiring a well-formed Checkout Session ID.
- Return only minimized entitlement state/features.

### `assets/nw-pro-entitlement.js`

- Replace the disabled-only scaffold with a server-backed product-scoped adapter while retaining a conservative inactive default.
- Keep sync state reads conservative and in-memory only.
- Add async server refresh/activation using `/api/billing/entitlement`.
- Persist only the product-scoped checkout session ID for restore convenience after the server confirms entitlement.
- Never persist `active=true` or treat persisted state as authority.
- Feature-active state requires both server-confirmed product entitlement and membership in the returned feature list.

### `billing/success.html`

- Replace stale “P04/P05 not implemented” copy with actual verification/pending/error states.
- Read `product_id`, `session_id` and optional validated `return_path` from the URL.
- Call the server-backed adapter; show active only after a verified entitlement response.
- Handle webhook race/pending state without claiming unlock.
- Do not display the raw session ID in page copy or analytics.

### Documentation / check

- Update billing docs that still describe the runtime as disabled-only where the implementation changes that fact.
- Add a static source-contract checker that verifies the high-risk billing invariants if feasible without new dependencies.

## 5. Step-by-step Procedure

1. Start from current main `74a30e0945d435648786e408c9d745c3c221e839`.
2. Preserve `okj.toolkit_pro` registry data exactly.
3. Generalize checkout product validation using registry + tier consistency, not a hardcoded product ID.
4. Harden webhook fulfillment for paid vs delayed-payment states.
5. Generalize entitlement lookup to registry-backed products.
6. Implement server-backed client entitlement state with product-scoped session restore convenience but no local active authority.
7. Wire success page to verified entitlement state.
8. Update billing runtime docs and add source-contract validation.
9. Verify changed-file scope excludes ManualFinder and legacy migration work.
10. Open PR, inspect CI and merge only after green/mergeable.

## 6. Test Plan

Static/runtime-contract checks must cover at minimum:

- unknown product ID is rejected by checkout and entitlement API;
- product must reference a valid price tier and valid Stripe price env name;
- unsafe `returnPath` is rejected;
- invalid/missing Stripe secret or enable flag fails closed;
- webhook rejects missing/bad signatures before entitlement issue;
- `checkout.session.completed` + `payment_status=unpaid` does not issue entitlement;
- `checkout.session.completed` + `payment_status=paid` can issue entitlement;
- `checkout.session.async_payment_succeeded` can issue the same entitlement idempotently;
- duplicate checkout session does not create duplicate entitlement;
- entitlement API only returns active for matching product + session + active D1 record;
- client adapter cannot become active from a forged local `active` flag because no such flag is used;
- client feature state requires server-returned feature membership;
- success page does not claim activation before verified server state;
- no raw user tool input is added to billing requests/metadata;
- `tools/manual-finder/**` is unchanged.

Run existing repository checks/CI in addition to the new billing contract check.

## 7. Rollback Plan

Revert this PR as one squash commit. Because this slice does not add products, change prices, or modify D1 schema, rollback restores the prior OKJ-only billing runtime and disabled client adapter without data migration. Existing D1 entitlement rows remain compatible and are not deleted.
