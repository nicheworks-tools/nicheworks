# NicheWorks Pro Boundary Contracts — Wave 6

Status: implementation/boundary staging; Incident Update Generator bundle membership approved; live commercial configuration unresolved  
Date: 2026-09-13  
Authority: `MONETIZATION_CLASSIFICATION_87.md`, `MONETIZATION_EXECUTION.md`, `docs/billing/nicheworks-common-billing-architecture.md`, `docs/billing/nicheworks-pro-bundle-contract.md`, current tool runtime/SPEC, canonical per-tool specifications under `docs/tools/`, and `assets/nw-product-scoped-controller.mjs`.

## 1. Shared rules

- Existing Free contractual behavior stays Free.
- `nicheworks.pro` is the canonical future shared NicheWorks Pro bundle product ID.
- Legacy `nicheworks_pro` is compatibility/migration state only and is not future purchase proof.
- An approved `PRO_BUNDLE` tool must still have an exact additive Free/Pro boundary before live migration.
- Browser-local flags, missing-entitlement fallbacks, query parameters, success-page arrival, DOM visibility, or cached active state are not future payment authority.
- Product-scoped entitlement traffic may contain fixed product/feature metadata only; tool input and generated user content remain outside billing.
- Price, currency, Stripe Product/Price, price tier, production feature IDs, restore/account policy, historical-purchaser treatment, and live/test rollout remain unresolved until explicitly authorized.

## 2. Incident Update Generator

### 2.1 Bundle classification

`MONETIZATION_CLASSIFICATION_87.md` classifies `incident-update-generator` as `PRO_BUNDLE`.

Therefore:

- it is an approved member of the future shared NicheWorks Pro bundle;
- future live paid authority is `nicheworks.pro`;
- no Incident-Update-specific paid product should be created merely to migrate its legacy gate;
- the current shared Payment Link and `nicheworks_pro` state remain migration evidence only.

### 2.2 Free boundary — fixed

The following current behavior remains Free:

- enter confirmed incident/service facts and select status/tone;
- generate separate customer, internal, and social drafts;
- mark missing optional fields as unconfirmed when selected;
- copy each generated audience draft;
- download the selected audience draft as TXT;
- use JA/EN UI and the current factual/legal/PR/security/SLA/compensation review warnings.

The core incident-drafting workflow must remain usable when billing is unavailable or entitlement verification fails.

### 2.3 Paid boundary — runtime-backed delta

Current runtime supports one additive paid value boundary:

1. **`communicationPack` — Incident Communication Pack**
   - Statuspage update;
   - Slack / Teams update;
   - support macro;
   - public review checklist;
   - postmortem outline;
   - GitHub Issue incident ticket;
   - next-update draft;
   - inclusion of the already-generated Free customer/internal/social drafts;
   - copy of the complete Markdown pack;
   - download of the complete Markdown pack.

Copy and Markdown save are delivery actions for the same generated communication pack, not separate commercial entitlements.

No direct publishing/integration, persistent incident history, automated postmortem database, or additional paid capability is invented by this boundary freeze.

### 2.4 Legacy entitlement hardening

Until live migration, current legacy Pro activation must require both:

- `status.active === true`; and
- exact `status.entitlement === "nicheworks_pro"`.

A missing or unrelated entitlement must not unlock the current pack. The historical shared Payment Link remains legacy commerce evidence only.

### 2.5 Product-scoped staging

`tools/incident-update-generator/product-scoped-controller.mjs` is a non-live wrapper around `assets/nw-product-scoped-controller.mjs`.

The staged contract requires:

- an explicit configured product ID with no implicit legacy fallback;
- a complete unique feature map for `communicationPack`;
- server-backed `refreshProState({ productId })` verification;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation activation only when the verified server response contains the mapped pack feature.

Wrong-product, local/browser-only, unverified, incomplete mapping, or entitlement-refresh failure states fail closed.

For production migration of this approved bundle member, the configured product ID must be `nicheworks.pro` plus the approved Incident Communication Pack feature mapping.

### 2.6 Privacy boundary

Incident facts and generated communication drafts can contain confidential operational, security, customer, vendor, legal, or business context. Billing/entitlement requests may contain fixed product/feature metadata only.

Do not send through billing/entitlement paths:

- service names or incident descriptions;
- impact, affected components, mitigation, times, duration, cause, or follow-up content;
- customer/internal/social drafts;
- Statuspage, Slack/Teams, support macro, review checklist, postmortem, GitHub ticket, or next-update content;
- filenames or export payloads;
- personal, customer, vendor, security, legal, SLA, compensation, or confidential details derived from the incident.

### 2.7 Live migration requirements

Migration is complete only when:

1. real `nicheworks.pro` commercial configuration is registered in `config/billing/products.json`;
2. the Incident Communication Pack feature ID is approved under that shared product;
3. checkout uses the common billing endpoint for `nicheworks.pro`;
4. signed Stripe webhook fulfillment records the matching entitlement in D1;
5. public runtime verifies the shared product server-side before enabling the pack;
6. Free draft generation/copy/TXT remains independent of billing availability;
7. failed/inactive checks leave the complete Free workflow usable;
8. unrelated product entitlements cannot unlock the pack;
9. billing/entitlement traffic contains no incident/generated content;
10. the historical shared Payment Link and legacy `nicheworks_pro` state stop being authoritative;
11. reload re-verifies server entitlement rather than trusting browser-local active state;
12. the current human-review and non-automation warnings remain intact.

Return path: `/tools/incident-update-generator/`.

### 2.8 Commercial fields still unresolved

Resolved:

- monetization class: `PRO_BUNDLE`;
- future shared product ID: `nicheworks.pro`;
- paid value boundary: `communicationPack`.

Still unresolved:

- NicheWorks Pro price/currency;
- Stripe Product and Price IDs;
- production Incident feature ID;
- restore/account policy;
- historical-purchaser treatment;
- live/test rollout and migration timing.
