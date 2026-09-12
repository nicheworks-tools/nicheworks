# ExecPlan — Outsource Spec Generator product-scoped staging

## Goal

Prepare Outsource Spec Generator for future migration from the live legacy shared NicheWorks Pro gate to the common product-scoped, server-verified entitlement foundation without changing the public runtime or inventing commercial configuration.

## Base

- Base main SHA: `d4f9be84a778f6733fd7bf50f9e00c1b70d94b30`
- Branch: `feat/outsource-spec-product-scoped-staging-20260912`
- Shared controller core: `assets/nw-product-scoped-controller.mjs`
- Billing contract: `docs/billing/pro-product-contracts-wave2.md`

## Current Free contract to preserve

- require work type, deliverables/scope, deadline, budget, and acceptance method;
- generate the current lightweight outsourcing specification locally;
- include current lightweight acceptance criteria and revision rules;
- copy the Free draft;
- JA/EN UI and current disclaimers.

## Current paid delta to stage

Runtime and SPEC evidence support eight paid operations:

1. `fullHandoffPack` — generate/copy the full outsource handoff pack.
2. `deliverablePack` — generate the deliverable pack.
3. `acceptanceChecklist` — generate/copy the acceptance checklist.
4. `vendorQuestions` — generate/copy the vendor preflight question list.
5. `codexTask` — generate/copy the Codex task.
6. `githubIssue` — generate/copy the GitHub Issue draft.
7. `markdownExport` — save the handoff pack as Markdown.
8. `jsonExport` — save the structured handoff as JSON.

Generate/copy controls for the same artifact are one paid value boundary rather than separate entitlements.

## Existing entitlement isolation to preserve

The current legacy bridge activates only when `NWPro.getLocalStatus()` reports both `active` and the exact shared entitlement `nicheworks_pro`. An unrelated product-scoped active entitlement must not unlock this tool during staging or migration.

## Privacy boundary

Outsourcing forms may contain project names, company names, budgets, deadlines, private URLs, deliverable details, confidentiality notes, and personal information. Billing/entitlement traffic may contain fixed product/feature metadata only, never form inputs or generated artifacts.

## Scope

- Add a thin Outsource Spec wrapper around the shared product-scoped controller core.
- Require explicit future `productId` and complete unique feature mapping for all eight operations.
- Add deterministic fail-closed tests covering partial feature activation and current runtime Free/Pro evidence.
- Protect the current legacy exact-entitlement isolation until live migration.
- Add path-scoped CI that reruns on shared core, app, bridge, SPEC, and Wave 2 contract changes.
- Update SPEC and Wave 2 billing contract documentation.

## Non-goals

- Do not register a product or invent product ID/name/price/currency/billing model/price tier/Stripe Price env/production feature namespace/live-test policy.
- Do not replace `pro-bridge.js` / `NWPro` in public runtime.
- Do not change drafting/builders, required fields, exports, language behavior, or disclaimers.
- Do not send project/form/generated content into billing/entitlement requests.
- Do not touch ManualFinder, affiliate, Amazon, or unrelated tools.

## Acceptance

- [x] Exactly eight runtime-backed paid operations are represented once each.
- [x] Wrapper delegates entitlement-state logic to the shared core.
- [x] Local-only, wrong-product, unverified, and refresh-failure states fail closed.
- [x] Partial verified feature lists unlock only mapped operations.
- [x] Free lightweight generation and copy remain explicitly protected.
- [x] Legacy exact `nicheworks_pro` entitlement isolation is protected until live migration.
- [x] Billing privacy contract excludes user-entered project data and generated artifacts.
- [x] Public runtime remains legacy until commercial configuration is authorized.
- [x] No commercial values are invented.
