# NicheWorks Pro Bundle Contract

Status: **commercial direction locked / runtime not yet live**  
Updated: 2026-09-13

## 1. Product identity

- Display name: `NicheWorks Pro`
- Canonical future product ID: `nicheworks.pro`
- Intended billing model: one-time purchase
- Price/currency: pending explicit decision
- Stripe Product/Price: pending explicit configuration
- Registry state: do not add until the real commercial fields are confirmed

`nicheworks.pro` is not the same identifier as legacy `nicheworks_pro`.

Legacy `nicheworks_pro` is a compatibility/migration label. It must not become the future purchase authority.

## 2. Product promise

One verified purchase of NicheWorks Pro unlocks the approved Pro operations of every tool explicitly included in the NicheWorks Pro bundle.

The bundle is **not** all 87 tools and is **not** automatically all historical Pro candidates.

Membership must be decided tool by tool from:

1. current runtime;
2. canonical per-tool specification;
3. actual professional/business/developer value;
4. existing Free behavior that must remain Free;
5. monetization evidence and product maturity.

## 3. Membership classification

Every registered tool must ultimately have one primary monetization classification:

- `PRO_BUNDLE`
- `STANDALONE_PRO`
- `AFFILIATE`
- `ADS_DONATION`
- `FREE`
- `HOLD`

Only `PRO_BUNDLE` tools consume `nicheworks.pro` as their paid product authority.

A tool is not a bundle member merely because it contains:

- `pro-bridge.js`;
- `NWPro`;
- `nicheworks_pro`;
- an old price label;
- a historical Payment Link;
- a staged product-scoped controller;
- an old roadmap that mentioned Pro.

## 4. Free/Pro rule

Each bundle member must define its own exact Free/Pro operation boundary.

Rules:

- preserve the useful Free core;
- do not move an existing Free capability behind Pro merely to create a paywall;
- paid value should be additive: scale, batch, saved workflow, richer report, professional export, handoff artifact, advanced analysis, project/history/preset value, or another clearly distinct professional operation;
- privacy/safety/legal disclaimers do not disappear or weaken when Pro is active;
- billing availability must never block the defined Free core.

## 5. Entitlement rule

Forward entitlement authority is server-verified product state from the common `/api/billing/*` foundation and D1 billing store.

For a bundle-member tool:

```text
productId = nicheworks.pro
server entitlement active
        +
operation mapped to an approved feature
        =
that Pro operation is enabled
```

A generic active state without exact product/feature verification is insufficient.

## 6. Browser-state rule

The browser may retain a non-authoritative restore reference such as a verified product-scoped Checkout Session ID when the shared adapter requires it.

The browser must not persist or trust an authoritative `active=true` purchase flag.

URL parameters and localStorage edits must not self-unlock Pro.

## 7. Standalone-product isolation

Current separate planning products include:

- `okj.toolkit_pro` — Old Kanji Toolkit Pro;
- `reconcile.pro_v1` — Reconcile Pro.

They remain separate until explicitly reviewed.

A standalone entitlement does not automatically grant NicheWorks Pro. NicheWorks Pro does not automatically grant a standalone product.

If a standalone product currently exposes a legacy/shared feature name such as `nicheworks_pro`, that must not be interpreted as proof of bundle membership or cross-product access.

## 8. Legacy purchaser rule

Do not delete or invalidate historical purchase records while migration is unresolved.

Before retiring the legacy shared Pro path, inventory actual purchases and define one of the following per valid historical purchase cohort:

- migrate to `nicheworks.pro`;
- grandfather equivalent access;
- retain a legacy-compatible entitlement during a transition period;
- another explicit treatment supported by billing evidence.

No migration is inferred solely from browser localStorage.

## 9. Reference migration acceptance

Command Safety Checker is the preferred first bundle-member reference.

The first live proof must demonstrate:

1. registered `nicheworks.pro` product and real Stripe configuration;
2. server-created checkout;
3. signed webhook verification;
4. active D1 entitlement;
5. server-confirmed activation after redirect;
6. only approved Command Safety paid operations unlock;
7. reload/revisit re-verifies successfully;
8. cancellation and unpaid checkout stay locked;
9. URL/localStorage tampering stays locked;
10. refund/revocation removes access.

Then a second approved bundle member must use the same verified purchase without another checkout. That is the suite-level acceptance test for the common bundle.

## 10. Commercial fields still pending

Do not invent or infer:

- NicheWorks Pro price;
- currency;
- Stripe Product ID;
- Stripe Price ID;
- Stripe Price environment-variable name;
- final restore/account policy;
- historical purchaser mapping before evidence review.

The old `$2.99` shared Payment Link and existing `$4.99` / `¥3,980` standalone planning prices do not establish the NicheWorks Pro price.

## 11. Rollout sequence

1. classify all 87 registered tools;
2. approve `PRO_BUNDLE` membership;
3. record exact Free/Pro operations for every member;
4. decide price and Stripe configuration;
5. add `nicheworks.pro` to the registry;
6. close D1 schema/deployment and legacy-migration questions;
7. migrate Command Safety Checker;
8. prove second-tool shared unlock;
9. migrate remaining members in small waves;
10. retire legacy shared billing only after coverage and purchaser migration are complete.

## 12. Freeze rule during migration

Until the shared bundle is commercially proven:

- do not create ad-hoc per-tool paid products for ordinary bundle candidates;
- do not add new hard-coded Payment Links;
- do not add new browser-local entitlement authorities;
- do not invent prices from reusable price tiers;
- do not block unrelated Free/affiliate/data/SEO/quality work.

Standalone product work may resume only when it is clearly separate and its own product contract is deliberately approved.
