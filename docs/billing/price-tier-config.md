# Historical planning note — superseded on 2026-10-31

**Do not use this old tier catalog to set Old Kanji Toolkit Pro pricing.** The canonical unpriced status is `config/billing/products.json` and `docs/old-kanji-toolkit/phase1-product-contract.md`. The Old Kanji product does not have an approved amount/currency/tier; never create Stripe Prices from the historical example below.

# Price Tier Config (Planning)

Status:
- Planning/config scaffold
- Runtime unchanged
- Stripe Checkout not implemented yet
- Webhook entitlement issuance not implemented yet

## 1. Purpose

This document defines reusable billing **price tiers** for NicheWorks billing config.
Price tiers are shared pricing metadata only; they are **not** entitlement boundaries.

## 2. Price tier model

Defined in `config/billing/products.json` as top-level `priceTiers`.

Each tier includes:
- `priceTierId` (stable reusable ID)
- `amount`
- `currency`
- `type`
- `label`

Current tiers:
- `nw.one_time.usd_299` → `$2.99` one-time (USD)
- `legacy-retired-okj-tier` → `(unapproved historical example)` one-time (USD)

## 3. Product linkage

Each product continues to own its own identity and Stripe env var mapping:
- product has `productId`
- product references one tier with `priceTierId`
- product keeps product-specific `stripe.priceIdEnv`

Example:
- `okj.toolkit_pro`
  - `priceTierId: legacy-retired-okj-tier`
  - `stripe.priceIdEnv: STRIPE_PRICE_OKJ_TOOLKIT_PRO`

## 4. Entitlement boundary (critical)

- Entitlement scope remains `productId`.
- Feature unlock scope remains each product's `features` list.
- Sharing the same price tier does **not** create shared unlock.

Therefore, a future `(unapproved historical example)` product must still define:
- its own `productId`
- its own `stripe.priceIdEnv`
- its own `features`

A purchase of one `(unapproved historical example)` product must not unlock another `(unapproved historical example)` product.

## 5. Future bundle/all-access note

Bundle or all-access offerings require explicit separate product definitions later
(e.g. dedicated bundle `productId` with explicit entitlement policy).
They are not implied by shared price tiers.
