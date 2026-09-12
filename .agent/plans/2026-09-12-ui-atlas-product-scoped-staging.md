# ExecPlan — UI Atlas product-scoped staging

## Goal

Prepare UI Atlas for migration from the live legacy shared NicheWorks Pro gate to the common product-scoped, server-verified entitlement foundation without inventing product/commercial configuration or changing the public UI yet.

## Base

- Original base main SHA: `7d0f7fc37597bf14d8728f97c0ba6d8b0e6fa1c8`
- Branch: `feat/ui-atlas-product-scoped-staging-20260912`
- Shared core: `assets/nw-product-scoped-controller.mjs`
- Final integration rule: rebase the staged files onto the latest `main` before opening the PR; preserve concurrent unrelated work.

## Current Free contract to preserve

- 100-example catalog search/filter/detail workflow.
- Short prompt copy.
- Favorites and recent views stored locally.
- Compare up to 2 patterns.
- Preview generator output, including Preview-marked copy/export behavior currently exposed by runtime.

## Current paid delta to stage

Runtime evidence supports three paid operations:

1. `fiveWayCompare` — raise compare limit from 2 to 5 patterns.
2. `fullHandoffOutput` — remove Preview-only restrictions/markers and expose the full handoff output layer.
3. `proSampleDetails` — unlock full details/use of the Pro-only sample bank rather than locked preview cards.

Markdown/JSON buttons themselves are not defined as paid operations because the current generator allows Preview-marked copy/export while Pro is inactive.

## Scope

- Add a thin UI Atlas wrapper around the shared product-scoped controller core.
- Require explicit future `productId` and a unique feature mapping for the three paid operations.
- Add deterministic UI Atlas staging contracts.
- Add path-scoped CI that also runs when the shared core changes.
- Update UI Atlas SPEC to distinguish live legacy behavior from non-live product-scoped staging.
- Update Wave 1 billing contract documentation with the exact UI Atlas Free/Paid boundary.

## Non-goals

- Do not register a UI Atlas product.
- Do not invent product ID, name, price, currency, billing model, price tier, Stripe Price env, or production feature namespace.
- Do not change the current hard-coded legacy `$2.99` copy in this staging wave; record it as legacy commerce copy only.
- Do not replace `pro-bridge.js`, `NWPro`, or public gating yet.
- Do not change catalog data, compare logic, generator output logic, favorites/recent storage, or language pages.
- Do not touch ManualFinder, affiliate, Amazon, TrashNavi, or unrelated billing products.

## Acceptance

- [x] Exactly three paid operations are represented once each.
- [x] UI Atlas wrapper delegates all entitlement state logic to the shared core.
- [x] Missing/wrong/local/unverified entitlement state fails closed through the shared core and its shared contract suite.
- [x] Partial server feature lists unlock only mapped UI Atlas operations.
- [x] Existing Free 2-way compare and Preview output remain explicitly protected by SPEC and deterministic runtime-evidence checks.
- [x] UI Atlas CI is path-scoped and reruns when the shared controller core changes.
- [x] Public runtime remains legacy until commercial configuration is authorized.
- [x] No commercial values are invented.

## Completion state

Implementation staging is complete on the feature branch. The remaining integration steps are branch normalization onto latest `main`, pull request CI, and squash merge. No live UI or billing activation is part of this wave.
