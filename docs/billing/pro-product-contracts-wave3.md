# NicheWorks Pro Boundary Contracts — Wave 3

Status: implementation/boundary staging; Contract Risk Highlighter bundle membership approved; live commercial configuration unresolved  
Date: 2026-09-13  
Authority: `MONETIZATION_CLASSIFICATION_87.md`, `MONETIZATION_EXECUTION.md`, `docs/billing/nicheworks-common-billing-architecture.md`, `docs/billing/nicheworks-pro-bundle-contract.md`, current tool runtime/SPEC, canonical per-tool specifications under `docs/tools/`, and `assets/nw-product-scoped-controller.mjs`.

## 1. Wave 3 shared rules

Wave 3 continues the staged migration discipline used by earlier Pro work. It freezes runtime-backed Free/Paid boundaries and migration safety requirements for approved bundle members; it does **not** launch pricing or connect live Stripe configuration.

- Existing Free contractual behavior stays Free.
- The forward billing engine remains product-scoped and server-verified.
- `nicheworks.pro` is the canonical future shared NicheWorks Pro bundle product ID.
- `nicheworks_pro` is the legacy browser/shared entitlement label only; it is not the future purchase authority.
- `MONETIZATION_CLASSIFICATION_87.md` is the canonical registered-tool membership ledger. A tool listed as `PRO_BUNDLE` is approved for the shared bundle at the commercial-classification level, but still requires an exact Free/Pro boundary and controlled live migration.
- An approved `PRO_BUNDLE` tool's live controller must verify `productId=nicheworks.pro` plus its own approved feature/operation mapping.
- Browser-local flags, legacy entitlement names, query parameters, success-page arrival, DOM visibility, or cached `active=true` values are not future purchase proof.
- Price, currency, Stripe Product/Price, price-tier mapping, production feature namespace, and live/test policy remain unresolved until explicitly authorized.
- Tool input and generated user content must not be added to billing/entitlement payloads.
- Historical shared Payment Links and legacy price copy are migration evidence only, not future commercial truth.
- Legacy shared-Pro hardening must be preserved until the tool is explicitly migrated live.

## 2. Contract Risk Highlighter

### 2.1 Bundle classification — approved

`MONETIZATION_CLASSIFICATION_87.md` classifies `contract-risk-highlighter` as `PRO_BUNDLE`.

Therefore:

- Contract Risk Highlighter is an approved member of the future shared NicheWorks Pro product;
- its future paid product authority is `nicheworks.pro`;
- it must **not** receive a separate Contract-Risk-specific paid product merely because its legacy gate is being migrated;
- approval does not make the current legacy gate live-ready and does not authorize removing existing Free behavior;
- this Wave 3 contract freezes the exact additive Free/Pro boundary needed before live migration.

### 2.2 Free boundary — fixed

The current Free review workflow remains available without paid entitlement:

- paste contract text and choose the supported contract type;
- run the current local clause/risk-pattern analysis;
- receive the overall risk badge and explanation;
- view up to three findings;
- view the Lite Markdown preview;
- copy the current Free Lite Markdown result;
- use example/reset, JP/EN UI, privacy warnings, and legal disclaimers.

No paid migration may move the core risk-pattern checker, overall result, first three findings, or Lite Markdown preview/copy behind Pro.

### 2.3 Paid boundary — runtime-backed delta

Current runtime/UI evidence supports exactly four paid value boundaries:

1. **Full Findings** — reveal the complete findings set beyond the Free three-item limit.
2. **Full Review Pack** — expose the Full Review Markdown plus consultation memo, counterparty questions, missing-clause checklist, and Next Action Memo; the current copy controls for these artifacts belong to the same bundled value surface.
3. **Markdown Export** — download the full review as Markdown.
4. **Print / Save PDF** — invoke the browser print path for the full result so the user can save it as PDF.

No additional paid feature is invented for this boundary freeze. Direct PDF contract extraction is not part of this paid boundary.

### 2.4 Staged product-scoped wrapper

`tools/contract-risk-highlighter/product-scoped-controller.mjs` is a non-live wrapper around `assets/nw-product-scoped-controller.mjs`.

The staged contract requires:

- an explicit configured product ID parameter with no implicit legacy fallback;
- a complete and unique feature-ID mapping for all four paid operations;
- server-backed `refreshProState({ productId })` through the shared controller core;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, and entitlement-refresh failure states fail closed. The staged wrapper contains no `NWPro`, `nicheworks_pro`, browser-storage authority, Payment Link logic, contract text, findings, generated review content, Blob payloads, or print logic.

For production migration of this approved bundle member, the configured product ID must be the canonical shared product `nicheworks.pro`. The wrapper remains parameterized because the common controller is tested independently of live registry/Stripe configuration; parameterization does not imply a separate per-tool product.

### 2.5 Legacy entitlement and UI/data hardening — must be preserved

Before product-scoped live migration, the public legacy bridge must require both:

- `status.active === true`; and
- exact `status.entitlement === "nicheworks_pro"`.

Generic active-like fields such as `isActive`, `proActive`, or a status string are not sufficient authority for Contract Risk Highlighter.

The current legacy bridge also enforces the paid boundary at action/data level rather than trusting `hidden` alone. When the exact legacy entitlement is inactive:

- `data-pro-active` is reset before ordinary tool interactions;
- Show All, Pro review-pack copy controls, Markdown download, and Print/Save PDF are blocked at event-capture time if controls are manually unhidden;
- hidden Full Review / consultation / counterparty / missing-clause / Next Action outputs are cleared after relevant interactions or entitlement refresh;
- the visible findings list is forced back to the Free three-item cap if a previous Pro session left the app's internal Show All state enabled.

These safeguards are interim migration hardening only. They do not turn the legacy browser-local entitlement into future payment authority.

### 2.6 Billing privacy boundary

Pasted contract text and generated review artifacts can contain confidential legal/commercial material, names, identifiers, payment terms, IP terms, URLs, and personal data. Product-scoped billing and entitlement requests may contain only fixed product/feature entitlement metadata.

Do not send any of the following through the billing/entitlement path:

- pasted contract text;
- contract snippets or matched clause text;
- contract type if it is bundled with user-entered context;
- risk findings, severity/category output, explanations, questions, or rewrite/check directions;
- Lite or Full Review Markdown;
- consultation memo, counterparty questions, missing-clause checklist, or Next Action Memo;
- download/print payloads or filenames;
- any personal, company, counterparty, financial, or confidential details extracted from the contract.

### 2.7 Live migration requirements

Contract Risk Highlighter migration is complete only when all of the following are true:

1. the real `nicheworks.pro` commercial configuration is registered in `config/billing/products.json`;
2. all four Contract Risk paid-operation feature IDs are approved and mapped under that shared product;
3. checkout uses the common billing endpoint for `nicheworks.pro`;
4. signed Stripe webhook fulfillment records the matching `nicheworks.pro` entitlement in D1;
5. public runtime uses server-verified shared-product state for the four paid value boundaries;
6. Free local analysis, overall result, first three findings, and Lite Markdown preview/copy remain independent of billing availability;
7. failed/inactive entitlement checks leave the complete current Free checker usable;
8. standalone/unrelated product entitlements cannot unlock this tool;
9. DOM unhiding or stale previous-Pro UI state cannot bypass paid action/data gates;
10. billing/entitlement traffic contains no contract or generated review content;
11. the historical shared Payment Link and legacy `nicheworks_pro` state stop being authoritative for this tool;
12. reload re-verifies `nicheworks.pro` against the server rather than trusting browser-local active state;
13. Print/Save PDF remains browser printing of the generated result and is not represented as direct PDF contract analysis;
14. the shared-bundle reference migration sequence has reached the point where this tool is authorized to move live.

Return path: `/tools/contract-risk-highlighter/`.

### 2.8 Commercial fields still unresolved

Resolved:

- monetization class: `PRO_BUNDLE`;
- future shared product ID: `nicheworks.pro`;
- exact Contract Risk Free/Paid operation boundary: frozen by this contract.

Still unresolved for live use:

- NicheWorks Pro price and currency;
- Stripe Product ID;
- Stripe Price ID and environment-variable mapping;
- production Contract Risk feature-ID namespace/mapping;
- final restore/account policy;
- historical-purchaser treatment;
- live/test rollout policy and migration wave timing.

Do not create a Contract-Risk-specific product merely to bypass those unresolved bundle decisions.

## 3. Wave 3 implementation order

1. Freeze exact additive Free/Pro boundaries for approved `PRO_BUNDLE` members from runtime/spec evidence.
2. Close existing legacy bypasses when a tool relies on weak browser/UI gating.
3. Keep Command Safety Checker as the first intended **live** `nicheworks.pro` reference migration once the real bundle commercial configuration is available.
4. Use the shared controller core for staging and keep each tool wrapper limited to its operation list and tool label.
5. Add privacy-specific regression checks for confidential, credential-bearing, legal, financial, or personal-data inputs.
6. Keep canonical `docs/tools/<slug>.md` and tool-local `SPEC.md` aligned with any runtime-hardening change.
7. Do not treat boundary/staging completion as product launch or Stripe configuration.

## 4. Definition of done — Contract Risk Highlighter boundary/staging

- canonical classification confirmed as `PRO_BUNDLE`;
- exact four-operation runtime-backed paid boundary frozen;
- Free three-finding + Lite Markdown preview/copy protected;
- thin shared-core wrapper with no contract/review-data dependency;
- deterministic fail-closed tests;
- future live product authority fixed to shared `nicheworks.pro`, with no separate Contract Risk product;
- exact legacy `nicheworks_pro` entitlement requirement preserved until migration;
- Pro-only controls blocked at execution time when inactive, not merely hidden;
- inactive hidden Pro outputs cleared;
- stale previous-Pro Show All state forced back to the Free three-finding cap;
- billing privacy boundary excludes contract/generated content;
- canonical and local tool specifications synchronized;
- current classification/bundle architecture documents reflected accurately;
- path-scoped CI;
- no price/Stripe configuration invented;
- public product-scoped runtime remains staged until the shared bundle is commercially configured and this migration wave is authorized.
