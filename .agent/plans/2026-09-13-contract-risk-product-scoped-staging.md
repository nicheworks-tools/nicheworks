# ExecPlan — Contract Risk Highlighter product-scoped staging

## Goal

Freeze Contract Risk Highlighter's exact additive Free/Pro boundary as an approved `PRO_BUNDLE` member, prepare it for future server-verified `nicheworks.pro` migration, preserve the current Free checker, and close current legacy Pro entitlement/UI/data-gating weaknesses.

## Base and authorities

- Initial implementation base: `c794b223185a6e4f46ed241185b45ba6a438bdf0`
- Branch: `feat/contract-risk-product-scoped-staging-20260912`
- Canonical monetization classification: `MONETIZATION_CLASSIFICATION_87.md` / `.json`
- Current monetization authority: `MONETIZATION_EXECUTION.md`
- Common billing authority: `docs/billing/nicheworks-common-billing-architecture.md`
- Shared bundle contract: `docs/billing/nicheworks-pro-bundle-contract.md`
- Contract Risk boundary contract: `docs/billing/pro-product-contracts-wave3.md`
- Shared controller core: `assets/nw-product-scoped-controller.mjs`
- Canonical per-tool specification: `docs/tools/contract-risk-highlighter.md`

The branch is rebased to the latest `main` immediately before PR validation because unrelated work lands frequently. The final PR must be `ahead=1 / behind=0` before merge.

## Classification and product authority

`MONETIZATION_CLASSIFICATION_87.md` classifies `contract-risk-highlighter` as `PRO_BUNDLE`.

Therefore:

- bundle membership is approved at the commercial-classification level;
- the future live product authority is the shared `nicheworks.pro` product;
- legacy `nicheworks_pro` remains compatibility/migration state only;
- this work must not create a Contract-Risk-specific paid product;
- exact price/currency/Stripe configuration and production feature IDs remain unresolved;
- this PR freezes the tool boundary and migration readiness but does not connect live billing.

## Free contract to preserve

- pasted contract-text analysis and contract-type selection;
- overall risk badge/explanation;
- up to three Free findings;
- Lite Markdown preview and copy;
- example/reset, JP/EN UI, privacy/legal disclaimers.

## Paid delta to freeze/stage

Current runtime/UI supports exactly four paid value boundaries:

1. `fullFindings` — reveal the complete findings set beyond the Free three-item limit.
2. `fullReviewPack` — expose the Full Review Markdown, consultation memo, counterparty questions, missing-clause checklist, and Next Action Memo, including current copy controls for those artifacts.
3. `markdownExport` — save the full review as `.md`.
4. `printPdf` — open browser Print / Save PDF for the full result.

The current review-pack panels are one bundled paid value surface rather than separate entitlements for each memo panel.

## Legacy gate hardening

The previous bridge accepted generic active-like state without checking entitlement. The shared `NWPro.getLocalStatus()` contract always returns an entitlement identifier, so current legacy Pro now requires both `status.active === true` and exact `status.entitlement === 'nicheworks_pro'`.

The previous paid UI also relied too heavily on hidden DOM state. The hardened bridge now ensures inactive state:

- cannot execute Show All, Pro pack copy, Markdown export, or Print/PDF actions merely by unhiding controls;
- resets `data-pro-active` before ordinary tool actions when the exact legacy entitlement is not active;
- clears hidden Pro review-pack fields after relevant interactions/status refresh;
- re-applies the Free three-finding cap even if a previous Pro session left the app's internal Show All state enabled.

## Product-scoped staging

The staged wrapper delegates to `assets/nw-product-scoped-controller.mjs` and represents only the four frozen operations.

It requires:

- an explicit configured product ID parameter;
- a complete, unique operation-to-feature map;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level feature presence.

Local-only, wrong-product, unverified, incomplete/duplicate mapping, and refresh-failure states fail closed.

The wrapper remains parameterized for deterministic staging/testing. For live migration of this approved bundle member, configuration must use `productId=nicheworks.pro`; parameterization does not imply a separate per-tool product.

## Privacy boundary

Contract text and generated review artifacts may contain confidential commercial/legal details and personal information. Billing/entitlement traffic may contain fixed product/feature metadata only and must not include pasted contract text, snippets, findings, generated review/memos/questions/checklists, filenames, print payloads, or extracted personal/company/confidential data.

## Scope

- Harden the current legacy bridge to exact shared-entitlement matching.
- Add runtime guards and inactive-state cleanup for existing Pro-only actions/outputs.
- Freeze the exact four-operation additive Pro boundary while preserving the Free core.
- Add a thin Contract Risk wrapper over the shared product-scoped controller core.
- Add deterministic fail-closed, Free/Pro-boundary, privacy, classification/bundle-authority, and legacy-hardening regression checks with path-scoped CI.
- Update `tools/contract-risk-highlighter/SPEC.md` and canonical `docs/tools/contract-risk-highlighter.md`.
- Add `docs/billing/pro-product-contracts-wave3.md` as a boundary/staging contract subordinate to current classification/common-billing/bundle authorities.

## Non-goals

- Do not create a Contract-Risk-specific paid product.
- Do not invent the NicheWorks Pro price/currency, Stripe Product/Price, price-tier mapping, production feature namespace, historical-purchaser policy, or live/test policy.
- Do not connect public runtime to the staged product-scoped wrapper yet.
- Do not change risk-pattern rules, legal conclusions/disclaimers, Free three-finding limit, Markdown builders, or print implementation.
- Do not add direct PDF contract parsing.
- Do not send contract content to billing/entitlement requests.
- Do not touch ManualFinder, affiliate, Amazon, or unrelated tools.

## Acceptance

- [x] Canonical classification confirms `contract-risk-highlighter` is `PRO_BUNDLE`.
- [x] Future live product authority is shared `nicheworks.pro`, not a tool-specific product.
- [x] Exactly four current paid value boundaries are represented once each.
- [x] Wrapper delegates entitlement state to the shared core.
- [x] Local-only, wrong-product, unverified and refresh-failure states fail closed.
- [x] Partial verified feature lists unlock only mapped operations.
- [x] Free three-finding + Lite Markdown preview/copy remains protected.
- [x] Legacy gate requires exact `nicheworks_pro`; generic active-like state is insufficient.
- [x] Free state cannot execute hidden Pro actions merely by unhiding DOM controls.
- [x] Hidden Pro output fields are cleared while inactive after relevant interactions/status refresh.
- [x] A stale previous-Pro Show All state cannot expose more than three findings after entitlement becomes inactive.
- [x] Billing privacy contract excludes contract text and generated review content.
- [x] Canonical per-tool specification stays aligned with runtime hardening and monetization classification.
- [x] Public product-scoped runtime remains staged until shared bundle commercial configuration and migration-wave authorization exist.
- [x] No price, Stripe configuration, or standalone product is invented.
