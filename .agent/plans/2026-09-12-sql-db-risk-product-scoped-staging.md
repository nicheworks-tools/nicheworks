# ExecPlan — SQL DB Risk Checker product-scoped staging

## Goal

Prepare SQL DB Risk Checker for migration from the live legacy shared NicheWorks Pro gate to the common product-scoped, server-verified entitlement foundation without inventing commercial configuration or changing the public checker runtime.

## Base

- Base main SHA: `c2057dd47739a3e0c2023a94cba12960827d15f7`
- Branch: `feat/sql-db-risk-product-scoped-staging-20260912`
- Shared controller core: `assets/nw-product-scoped-controller.mjs`
- Billing contract: `docs/billing/pro-product-contracts-wave2.md` (Wave 2 begins with this staging candidate).
- Final integration rule: normalize staged files onto latest `main` before opening the PR and preserve concurrent unrelated work.

## Current Free contract to preserve

- paste and analyze one or more SQL statements locally;
- environment / database-type / read-only controls;
- current rule-based risk level, warnings, reasons, verification guidance and SQL preview;
- risk-summary copy;
- pre-run checklist copy;
- JA/EN UI and safety disclaimers.

## Current paid delta to stage

Runtime and SPEC evidence support seven paid operations:

1. `safeExecutionPack` — copy Safe Execution Pack.
2. `reviewSummary` — copy Review Summary.
3. `dbChecklist` — copy DB-specific Checklist.
4. `migrationReview` — copy Migration Review.
5. `teamHandoff` — copy Team Handoff.
6. `markdownExport` — save Markdown review export.
7. `jsonExport` — save JSON review export.

The historical shared Stripe Payment Link and any legacy price copy are migration inputs only and do not establish future product/commercial terms.

## Scope

- Add a thin SQL DB Risk wrapper around the shared product-scoped controller core.
- Require an explicit future `productId` and complete unique feature mapping for all seven paid operations.
- Add deterministic staging contracts covering fail-closed behavior and current runtime Free/Paid evidence.
- Add path-scoped CI that also runs when the shared controller core changes.
- Update SQL DB Risk SPEC and start Wave 2 billing contract documentation.
- Preserve the previous bypass hardening: entitlement naming alone must never activate paid behavior.

## Non-goals

- Do not register a SQL DB Risk product.
- Do not invent product ID, display name, price, currency, billing model, price tier, Stripe Price env, production feature namespace, or live/test policy.
- Do not replace `pro-bridge.js`, `NWPro`, or public gating yet.
- Do not change SQL parsing/risk rules, result rendering, exports, language behavior, or disclaimers.
- Do not send SQL text, parsed statements, warnings, table/column names, or generated review content into billing/entitlement requests.
- Do not touch ManualFinder, affiliate, Amazon, or unrelated tools.

## Acceptance

- [x] Exactly seven current paid operations are represented once each.
- [x] Wrapper delegates entitlement state logic to the shared core.
- [x] Local-only, wrong-product, unverified and refresh-failure states fail closed through the shared core contract.
- [x] Partial verified feature lists unlock only mapped SQL DB Risk operations.
- [x] Free risk-summary and checklist copy remain explicitly protected.
- [x] Previous entitlement-name-only bypass cannot be reintroduced into the staged wrapper.
- [x] Current runtime evidence for all seven paid outputs is covered by deterministic checks.
- [x] Path-scoped CI reruns on shared controller-core and Wave 2 contract changes.
- [x] Public runtime remains legacy until commercial configuration is authorized.
- [x] No commercial values are invented.

## Completion state

Implementation staging is complete on the feature branch. Remaining integration work is branch normalization onto latest `main`, pull-request CI, and squash merge. No public runtime or live billing activation is included in this wave.
