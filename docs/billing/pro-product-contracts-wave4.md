# NicheWorks Pro Boundary Contracts — Wave 4

Status: implementation/boundary staging; AI Interaction Atlas bundle membership approved; live commercial configuration unresolved  
Date: 2026-09-13  
Authority: `MONETIZATION_CLASSIFICATION_87.md`, `MONETIZATION_EXECUTION.md`, `docs/billing/nicheworks-common-billing-architecture.md`, `docs/billing/nicheworks-pro-bundle-contract.md`, current AI Interaction Atlas runtime/SPEC, and `assets/nw-product-scoped-controller.mjs`.

## 1. Shared rules

- Existing Free contractual behavior stays Free.
- `ai-interaction-atlas` is an approved `PRO_BUNDLE` member.
- The future paid product authority is the shared product `nicheworks.pro`.
- Legacy `nicheworks_pro` is compatibility/migration state only.
- No tool-specific paid product is created.
- Price, currency, Stripe Product/Price, price-tier mapping, production feature IDs, purchaser migration, restore policy, and live/test rollout remain unresolved.
- Product-scoped billing/entitlement traffic may contain fixed product/feature metadata only; atlas search, selected pattern, comparison and generated handoff content remain local.

## 2. AI Interaction Atlas

### 2.1 Free boundary — fixed

The current Free contract remains:

- load and browse the local AI interaction pattern atlas;
- text search and category/purpose/risk/control/visibility filters;
- open pattern details, best-fit/non-fit guidance, failure states, trust notes, implementation notes, common mistakes and required states;
- copy the basic implementation prompt;
- maintain recent items locally;
- save up to five favorites;
- compare up to two patterns;
- view/copy the Free comparison rows;
- use the English and Japanese page families.

Current runtime always caps favorites at five, including while legacy Pro is active. A larger favorite limit is therefore **not** part of the paid boundary.

### 2.2 Paid boundary — runtime-backed delta

Current runtime supports exactly four paid value boundaries:

1. **Advanced Compare (`advancedCompare`)** — raise the comparison capacity from two to four patterns and expose the additional Pro comparison rows beyond the Free seven-row comparison.
2. **Handoff Copy (`handoffCopy`)** — copy the generated Product Spec, Codex implementation task, GitHub Issue, UX risk checklist, and Safety/Fallback checklist blocks.
3. **Handoff Export (`handoffExport`)** — save the selected-pattern handoff as Markdown or JSON.
4. **Comparison Export (`comparisonExport`)** — save the current comparison as Markdown or JSON.

The preview text may show the shape of Pro output while inactive, but copying/saving those paid artifacts remains gated. No new paid feature is invented by this contract.

### 2.3 Current legacy authority — hardening

The public bridge currently uses the legacy shared `NWPro` client. Until live migration, legacy activation must require both:

- `status.active === true`; and
- exact `status.entitlement === "nicheworks_pro"`.

A missing entitlement must not fall back to `nicheworks_pro`. An unrelated active product must not unlock AI Interaction Atlas.

This is temporary migration hardening and must not be mistaken for future purchase authority.

### 2.4 Product-scoped staging

`tools/ai-interaction-atlas/product-scoped-controller.mjs` is a thin non-live wrapper around `assets/nw-product-scoped-controller.mjs`.

It exposes exactly:

- `advancedCompare`
- `handoffCopy`
- `handoffExport`
- `comparisonExport`

The wrapper requires an explicit product ID and a complete unique feature mapping. It accepts activation only from the shared controller's server-verified state and fails closed for wrong-product, local-only, unverified, incomplete/duplicate mapping, or refresh-failure states.

For production migration of this approved bundle member, the configured product ID must be `nicheworks.pro`. Parameterization exists for testing/migration plumbing; it does not imply a separate per-tool product.

### 2.5 Privacy boundary

Billing and entitlement requests must not contain:

- search text or active filters;
- selected/favorite/recent pattern identities where they originate from user interaction;
- compared-pattern content;
- generated Product Spec, Codex task, GitHub Issue, UX-risk or Safety/Fallback content;
- Markdown/JSON output bodies or filenames;
- any future user-entered notes added to atlas workflows.

Only fixed product/feature entitlement metadata may cross the billing boundary.

### 2.6 Live migration requirements

AI Interaction Atlas may move from the legacy bridge only when:

1. real `nicheworks.pro` commercial configuration exists in the common registry;
2. all four AI Interaction Atlas operation feature IDs are approved under that shared product;
3. checkout is created through the common billing endpoint for `nicheworks.pro`;
4. signed webhook fulfillment records the shared entitlement in D1;
5. public EN/JA runtime verifies server state before enabling the four paid boundaries;
6. Free browsing/search/filter/detail/basic prompt, five favorites, two-item comparison and Free comparison copy remain available during billing failure;
7. URL/localStorage/custom event/DOM changes are not accepted as future payment proof;
8. unrelated standalone-product entitlements cannot unlock the atlas;
9. billing traffic contains no atlas interaction or generated user content;
10. reload/revisit re-verifies the server entitlement;
11. refund/revocation removes paid access;
12. the shared-bundle rollout has reached the migration wave authorizing this tool.

Return paths: `/tools/ai-interaction-atlas/` and `/tools/ai-interaction-atlas/ja/` according to the originating page.

### 2.7 Commercial fields unresolved

Resolved:
- class: `PRO_BUNDLE`;
- shared product ID: `nicheworks.pro`;
- exact four runtime-backed paid value boundaries above.

Unresolved:
- bundle price/currency;
- Stripe Product/Price IDs;
- Stripe Price environment mapping;
- production feature-ID namespace;
- purchaser grandfather/migration policy;
- cross-browser restore policy;
- live/test rollout timing.

## 3. Definition of done — boundary/staging

- exact Free behavior preserved;
- exact four paid value boundaries documented;
- legacy missing-entitlement fallback removed;
- thin shared-core controller added;
- fail-closed operation tests added;
- tool-local and canonical specifications synchronized;
- `nicheworks.pro` fixed as future live product authority;
- no price/Stripe/runtime billing configuration invented;
- public product-scoped runtime remains staged until the common bundle is commercially configured.
