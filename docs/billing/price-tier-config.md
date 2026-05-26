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
- `nw.one_time.usd_499` → `$4.99` one-time (USD)

## 3. Product linkage

Each product continues to own its own identity and Stripe env var mapping:
- product has `productId`
- product references one tier with `priceTierId`
- product keeps product-specific `stripe.priceIdEnv`

Example:
- `okj.toolkit_pro`
  - `priceTierId: nw.one_time.usd_499`
  - `stripe.priceIdEnv: STRIPE_PRICE_OKJ_TOOLKIT_PRO`

## 4. Entitlement boundary (critical)

- Entitlement scope remains `productId`.
- Feature unlock scope remains each product's `features` list.
- Sharing the same price tier does **not** create shared unlock.

Therefore, a future `$4.99` product must still define:
- its own `productId`
- its own `stripe.priceIdEnv`
- its own `features`

A purchase of one `$4.99` product must not unlock another `$4.99` product.

## 5. Future bundle/all-access note

Bundle or all-access offerings require explicit separate product definitions later
(e.g. dedicated bundle `productId` with explicit entitlement policy).
They are not implied by shared price tiers.
