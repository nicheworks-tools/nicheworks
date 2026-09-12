# ExecPlan — API Key Token Redactor product-scoped staging

## Goal

Prepare API Key Token Redactor for migration from the live legacy shared NicheWorks Pro gate to the common product-scoped, server-verified entitlement foundation while preserving the tool's secret-safety hardening and without inventing commercial configuration or changing public runtime behavior.

## Base

- Base main SHA: `6ecda0bbc8726023dfb9eb218778269432fce01d`
- Branch: `feat/api-key-redactor-product-scoped-staging-20260912`
- Shared controller core: `assets/nw-product-scoped-controller.mjs`
- Billing contract: `docs/billing/pro-product-contracts-wave2.md`

## Current Free contract to preserve

- local detection of supported API-key/token/private-key/labeled-secret/header/URL/Cookie patterns;
- category toggles and replacement style controls;
- redacted output, counts, findings and coverage/safety summary;
- sample inputs and clear/reset;
- copy redacted output;
- TXT download of redacted output;
- JA/EN UI.

## Current paid delta to stage

Runtime/UI evidence supports eight paid operations:

1. `customRules` — add/remove custom secret-prefix rules used by Pro-active scanning.
2. `redactionProfiles` — select the Pro-only handoff/redaction profile used by generated artifacts.
3. `auditMarkdown` — copy Audit Markdown.
4. `githubIssueTemplate` — copy GitHub Issue template.
5. `supportTemplates` — copy Support or Discord sharing templates.
6. `jsonFindingsExport` — download JSON findings.
7. `csvFindingsExport` — download CSV findings.
8. `handoffMarkdownExport` — download Markdown handoff pack.

## Secret-safety contract

The staged migration must preserve the existing hardening introduced around Pro artifacts:

- visible finding/verification code previews must use a safe redacted marker rather than credential fragments;
- clipboard writes for review artifacts are scrubbed;
- string Blob parts used for downloads are scrubbed;
- billing/entitlement requests must never receive pasted secret-bearing input, detected raw values, preview fragments, redacted output, findings, generated templates, filenames, or export payloads;
- only fixed product/feature entitlement metadata may cross the billing boundary.

## Scope

- Add a thin wrapper around the shared product-scoped controller core.
- Require explicit future `productId` and complete unique feature mapping for all eight paid operations.
- Add deterministic fail-closed and privacy regression tests.
- Add path-scoped CI that reruns on shared-core, app, bridge, SPEC, and Wave 2 billing-contract changes.
- Update API Key Token Redactor SPEC and Wave 2 billing contract documentation.

## Non-goals

- Do not register a product or invent product ID/name/price/currency/billing model/price tier/Stripe Price env/production feature namespace/live-test policy.
- Do not replace the current `pro-bridge.js` / `NWPro` public gate.
- Do not modify detector regexes, redaction logic, safe-preview logic, export builders, UI, or language behavior.
- Do not weaken the current secret-preview hardening.
- Do not touch ManualFinder, affiliate, Amazon, or unrelated tools.

## Acceptance

- [x] Exactly eight paid operations are represented once each.
- [x] Wrapper delegates entitlement state logic to the shared core and contains no secret input/output dependencies.
- [x] Local-only, wrong-product, unverified and refresh-failure states fail closed.
- [x] Partial verified feature lists unlock only mapped operations.
- [x] Free redaction/copy/TXT behavior remains explicitly protected.
- [x] Pro UI/runtime evidence for custom rules, profiles and seven artifact/export actions is covered.
- [x] Clipboard, Blob and visible-preview secret-scrubbing hardening is protected by deterministic checks.
- [x] Billing privacy contract excludes all secret-bearing/user-generated content.
- [x] Public runtime remains legacy until commercial configuration is authorized.
- [x] No commercial values are invented.

## Result

Staging is complete on the branch when the six-file change set is reduced to one commit on the latest main, the dedicated privacy/product-scoped contract CI and repository-wide required audits pass, and the PR is squash-merged. This staging work does not activate a live product or establish commercial settings.
