# Billing Config and Mock Entitlement Scaffold

Status:
- Planning/config scaffold
- Runtime unchanged
- Stripe not implemented yet
- Checkout not implemented yet
- Webhook not implemented yet
- Real entitlement not implemented yet
- Pro unlock not implemented yet
- Mock entitlement disabled by default
- Based on OKJ-P01

## 1. Purpose

This scaffold adds product config and mock entitlement scaffolding only.
It prepares implementation handoff for P03-P05 but does not implement real billing behavior.

## 2. Files

- `config/billing/products.json`
- `config/billing/mock-entitlements.json`
- `docs/billing/billing-config-and-mock-entitlement.md`

## 3. Product config

`config/billing/products.json` defines a billing product registry with planning-only values.

- `schemaVersion`: config schema identifier for backward-compatible validation.
- `productId`: stable internal product key.
- `displayName`: localized product label for EN/JA surfaces.
- `price`: list price metadata (`amount`, `currency`, `type`).

- `priceTiers`: reusable pricing metadata (`priceTierId`, `amount`, `currency`, `type`, `label`).
- `priceTierId`: product reference to a reusable price tier entry.
- `stripe.mode`: integration status (`not_connected` in this phase).
- `stripe.priceIdEnv`: environment-variable name placeholder for future Stripe price mapping.
- `features`: feature entitlement IDs mapped from OKJ Pro planning docs.
- `ui.state`: current billing UX state (`billing-unavailable`).
- `ui.cta`: localized CTA labels while billing is not connected.
- `ui.billingUnavailableNote`: localized note clarifying billing is not live.

## 4. Initial product

Initial registry/tier entries:

Price tiers:
- `nw.one_time.usd_299` (`$2.99` one-time, `USD`)
- `nw.one_time.usd_499` (`$4.99` one-time, `USD`)

Product:
- `okj.toolkit_pro`
- references `priceTierId: nw.one_time.usd_499`
- keeps product-level list price (`$4.99` one-time, `USD`)
- Stripe not connected (`stripe.mode: not_connected`)
- Stripe env var remains product-specific (`STRIPE_PRICE_OKJ_TOOLKIT_PRO`)
- UI state `billing-unavailable`

## 5. Feature list

The initial product includes the following feature IDs:

- `okj.batchOcr`
- `okj.scanHistory`
- `okj.oldKanjiCollection`
- `okj.exportCsv`
- `okj.exportMarkdown`
- `okj.exportJson`
- `okj.report`
- `okj.cropOcr`
- `okj.zoomInspect`
- `okj.imageMarking`
- `okj.batchNameCheck`
- `okj.batchPlaceCheck`
- `okj.batchTextHighlight`
- `okj.savedCompareSets`
- `okj.unicodeAuditExport`
- `okj.quizHistory`

## 6. Mock entitlement

`config/billing/mock-entitlements.json` is development/testing scaffolding only.

- Mock entitlement is dev/test only.
- Disabled by default (`enabledByDefault: false`).
- Not a source of truth for purchase state.
- Not a payment record.
- Must not be used for production unlock.
- Must not be exposed to users as real Pro ownership.

## 7. Security constraints

- No Stripe secret keys.
- No real Stripe price IDs.
- No webhook secrets.
- No client-side self unlock.
- No URL-param unlock.
- No localStorage-only paid access.
- No real payment state sourced from mock config.

## 8. Privacy constraints

- No user OCR text in billing config.
- No names/addresses/documents in billing metadata.
- No analytics/ad IDs in entitlement config.
- No user content stored in mock entitlements.

## 9. Relationship to OKJ docs

This scaffold aligns with the following docs:

- `docs/billing/nicheworks-common-billing-architecture.md`
- `docs/old-kanji-toolkit/free-pro-ocr-billing-roadmap.md`
- `docs/old-kanji-toolkit/pro-feature-matrix.md`
- `docs/old-kanji-toolkit/pro-gate-ui-design.md`
- `docs/old-kanji-toolkit/export-report-format-spec.md`

## 10. Future implementation order


- P03 checkout/success/cancel scaffold doc: `docs/billing/stripe-checkout-success-cancel-flow.md`

- P04-A contract (disabled webhook scaffold + entitlement contract only): `docs/billing/stripe-webhook-entitlement-issue.md`

### P03
- Checkout/success/cancel scaffold only (see `docs/billing/stripe-checkout-success-cancel-flow.md`).
- Still no webhook entitlement issuance in this phase.

### P04
- Webhook verification.
- Entitlement issuance.
- Idempotency handling.

### P05
- Real entitlement checks.
- Pro UI unlock in OKJ tools.

## 11. Validation

Validation checklist for this scaffold:

- `products.json` parses.
- `mock-entitlements.json` parses.
- `okj.toolkit_pro` exists.
- Feature IDs are non-empty strings.
- No real Stripe IDs.
- `enabledByDefault` is `false`.
- No runtime/tool files changed.

## 12. Price tier vs entitlement boundary

- Price tiers are reusable price metadata only.
- Entitlement boundary remains `productId`, not `priceTierId`.
- Feature unlock scope remains each product's `features` list.
- A future `$4.99` tool must define its own `productId` and its own Stripe `priceIdEnv`.
- Shared tier does not mean shared unlock.
- Bundle/all-access requires separate explicit `productId` later.

Mock entitlement behavior is unchanged:
- still disabled by default
- still dev/mock only
- still not production purchase state
