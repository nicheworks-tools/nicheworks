# NicheWorks Pro Boundary Contracts — Wave 7

Status: implementation/boundary staging; JSON Repair bundle membership approved; live commercial configuration unresolved  
Date: 2026-09-13  
Authority: `MONETIZATION_CLASSIFICATION_87.md`, `MONETIZATION_EXECUTION.md`, `docs/billing/nicheworks-common-billing-architecture.md`, `docs/billing/nicheworks-pro-bundle-contract.md`, current JSON Repair runtime/SPEC, canonical per-tool specifications under `docs/tools/`, and `assets/nw-product-scoped-controller.mjs`.

## 1. Shared rules

- Existing Free contractual behavior stays Free.
- `nicheworks.pro` is the canonical future shared NicheWorks Pro bundle product ID.
- Legacy `nicheworks_pro` is compatibility/migration state only and is not future purchase proof.
- Browser-local flags, missing-entitlement fallbacks, query parameters, success-page arrival, DOM visibility, or cached active state are not future payment authority.
- Billing/entitlement requests may contain fixed product/feature metadata only; JSON input and generated data remain outside billing.
- Historical `$2.99` and shared Payment Link copy are legacy commerce evidence only, not future price authority.
- Price, currency, Stripe Product/Price, price tier, production feature IDs, restore/account policy, historical-purchaser treatment, and live/test rollout remain unresolved until explicitly authorized.

## 2. JSON Repair

### 2.1 Bundle classification

`MONETIZATION_CLASSIFICATION_87.md` classifies `json-repair` as `PRO_BUNDLE`.

Therefore JSON Repair is an approved member of the future shared NicheWorks Pro bundle, its future live paid authority is `nicheworks.pro`, and no JSON-Repair-specific product should be created merely to migrate the legacy gate.

### 2.2 Free boundary — fixed

The following current behavior remains Free:

- paste JSON/JSONC-like text and load local JSON/text files;
- Auto/JSON/JSONC interpretation;
- validate and display syntax/error/explanation information;
- Safe repair;
- Standard repair, including automatic extraction of one likely JSON candidate from mixed log text;
- Pretty and Minify;
- repaired/formatted/validate tabs;
- repair log and simple diff;
- copy current result;
- normal `.json` download;
- current Free samples;
- JA/EN UI and current privacy/repair-risk warnings.

### 2.3 Paid boundary — runtime-backed delta

Current runtime supports exactly six additive paid value boundaries:

1. **`aggressiveRepair`** — stronger repair for single quotes, unquoted keys, and Python-like `True` / `False` / `None` literals.
2. **`candidateActions`** — Use / Repair actions for the detected JSON candidate list. Standard Free repair may still automatically extract one likely candidate; this paid boundary covers the interactive candidate controls.
3. **`schemaCheck`** — current simple `required` / `type` schema-rule check. This is not a promise of full JSON Schema support.
4. **`history`** — current browser-local repair history save/render/clear workflow.
5. **`reportExport`** — repair report copy plus Markdown and JSON advanced report export. These are delivery variants of the same report/export value surface.
6. **`proSamples`** — loading the current Pro-marked stronger-repair samples.

No existing Free validation, Safe/Standard repair, Pretty/Minify, copy, normal `.json` download, repair log, simple diff, or Free sample is moved behind Pro.

### 2.4 Legacy entitlement hardening

Until live migration, current legacy Pro activation must require both:

- `status.active === true`; and
- exact `status.entitlement === "nicheworks_pro"`.

A missing or unrelated entitlement must not unlock the current paid surface. The historical `$2.99` copy and shared Payment Link remain migration evidence only.

### 2.5 Product-scoped staging

`tools/json-repair/product-scoped-controller.mjs` is a non-live wrapper around `assets/nw-product-scoped-controller.mjs`.

The staged contract requires:

- an explicit configured product ID with no implicit legacy fallback;
- complete unique feature mapping for all six paid operations;
- server-backed `refreshProState({ productId })` verification;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation activation only when the verified server response contains that operation's mapped feature.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, or entitlement-refresh failure states fail closed.

For production migration of this approved bundle member, the configured product ID must be `nicheworks.pro` plus the approved JSON Repair feature mapping.

### 2.6 Privacy boundary

JSON content can contain credentials, personal data, internal identifiers, URLs, configuration, business logic, or other confidential material. Billing/entitlement requests may contain fixed product/feature metadata only.

Do not send through billing/entitlement paths:

- pasted or loaded JSON/JSONC/text;
- parsed/repaired/formatted/minified JSON;
- candidate text;
- schema rules or schema findings;
- repair logs or diff content;
- browser history data derived from repairs;
- report/Markdown/JSON export content or filenames;
- any values, keys, identifiers, credentials, URLs, or personal/confidential details derived from user input.

### 2.7 Live migration requirements

Migration is complete only when:

1. real `nicheworks.pro` commercial configuration is registered in `config/billing/products.json`;
2. all six JSON Repair feature IDs are approved under that shared product;
3. checkout uses the common billing endpoint for `nicheworks.pro`;
4. signed Stripe webhook fulfillment records the matching entitlement in D1;
5. public runtime verifies shared-product server state before enabling paid operations;
6. all current Free repair/format/copy/download behavior remains independent of billing availability;
7. failed/inactive entitlement checks leave the complete Free workflow usable;
8. unrelated product entitlements cannot unlock JSON Repair Pro;
9. billing/entitlement traffic contains no JSON or generated user content;
10. the historical Payment Link, `$2.99` copy, and legacy `nicheworks_pro` state stop being authoritative;
11. reload re-verifies server entitlement rather than trusting browser-local active state;
12. aggressive repair remains clearly distinguished as a stronger heuristic that may change meaning.

Return path: `/tools/json-repair/`.

### 2.8 Commercial fields still unresolved

Resolved:

- monetization class: `PRO_BUNDLE`;
- future shared product ID: `nicheworks.pro`;
- six runtime-backed paid value boundaries.

Still unresolved:

- NicheWorks Pro price/currency;
- Stripe Product and Price IDs;
- production JSON Repair feature IDs;
- restore/account policy;
- historical-purchaser treatment;
- live/test rollout and migration timing.
