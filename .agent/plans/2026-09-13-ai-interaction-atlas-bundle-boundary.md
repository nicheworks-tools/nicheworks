# ExecPlan: AI Interaction Atlas NicheWorks Pro bundle boundary

## Goal
Freeze the exact runtime-backed Free/Pro boundary for `ai-interaction-atlas`, harden its current legacy shared-Pro entitlement check, and stage a fail-closed product-scoped controller for future `nicheworks.pro` migration without changing live checkout or inventing commercial configuration.

## Authority
- `MONETIZATION_CLASSIFICATION_87.md`: `ai-interaction-atlas` is `PRO_BUNDLE`.
- `MONETIZATION_EXECUTION.md`: future bundle product is `nicheworks.pro`.
- `docs/billing/nicheworks-pro-bundle-contract.md`: existing Free value remains Free; live access must be server verified.
- current runtime and canonical/local tool specifications are the feature evidence.

## Runtime-backed boundary

Free remains:
- local/searchable atlas browsing and filters;
- pattern details and basic implementation-prompt copy;
- recent items;
- up to five favorites;
- up to two compared patterns;
- Free comparison rows and Free comparison copy;
- EN/JA pages.

Paid value is grouped into four operation boundaries already evidenced by runtime:
1. `advancedCompare` — 3–4 compared patterns plus the additional Pro comparison rows.
2. `handoffCopy` — copy the current Product Spec, Codex task, GitHub Issue, UX risk, and Safety/Fallback handoff blocks.
3. `handoffExport` — save selected-pattern handoff as Markdown or JSON.
4. `comparisonExport` — save comparison output as Markdown or JSON.

No additional paid feature is invented. Favorites remain capped at five because current runtime does not implement a higher Pro favorite limit.

## Legacy hardening

The current bridge contains an entitlement fallback that can treat a missing entitlement as `nicheworks_pro`. Replace it with an exact requirement:

- `status.active === true`
- `status.entitlement === "nicheworks_pro"`

This remains temporary compatibility logic only.

## Product-scoped staging

Add a thin wrapper over `assets/nw-product-scoped-controller.mjs` with exactly the four operations above.

For future live migration:
- configured product ID must be `nicheworks.pro`;
- feature mapping must be complete and unique;
- wrong-product/local-only/unverified/refresh-failure states fail closed;
- search terms, selected pattern data, comparison content, generated handoff text, filenames, and exports never enter billing/entitlement requests.

## Out of scope
- no price/currency decision;
- no Stripe Product/Price or registry entry;
- no D1 migration;
- no live product-scoped runtime connection;
- no atlas dataset/content changes;
- no new Pro functionality;
- no affiliate/ManualFinder/Amazon changes.

## Validation
- exact four-operation staged-controller test;
- partial feature lists unlock only mapped operations;
- local/wrong-product/unverified states fail closed;
- current Free 2-item compare and five-favorite cap protected;
- current Pro 4-item compare and extended comparison rows protected;
- current handoff copy/export runtime evidence protected;
- exact legacy entitlement requirement protected;
- canonical/local specs and Wave 4 boundary contract aligned with `PRO_BUNDLE` + `nicheworks.pro`.
