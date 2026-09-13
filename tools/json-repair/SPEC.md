# Tool Specification — JSON Repair

- Slug: `json-repair`
- Public URL: `https://nicheworks.app/tools/json-repair/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Canonical per-tool specification: `docs/tools/json-repair.md`
- Monetization class: `PRO_BUNDLE`

## Purpose

Validate, format, minify, and repair common broken-JSON cases in the browser, with stronger repair, candidate/schema/history, and report tooling gated behind NicheWorks Pro.

## Current functional contract

- Accept pasted or loaded `.json` / text input and support Auto, JSON, and JSONC interpretation modes.
- Validate syntax and show error/explanation information.
- Free mode provides Safe and Standard repair, including the implemented automatic extraction of one likely JSON candidate from mixed log text.
- Free mode also provides Pretty and Minify, repaired/formatted/validate result tabs, repair log, simple diff, copy, normal `.json` download, and current Free samples.
- The current legacy shared-Pro surface has six paid value boundaries: Aggressive repair; interactive candidate Use/Repair; simple required/type schema check; local repair history; repair report/Markdown/JSON advanced export; and loading Pro-marked samples.
- Current legacy activation requires both `status.active === true` and exact entitlement `nicheworks_pro`; missing or unrelated entitlement state is not authoritative.
- The active legacy integration remains embedded in `app.js`; the staged product-scoped controller is non-live.
- Switch the same interface between Japanese and English.

## Inputs

- JSON/JSONC-like text or local `.json` / text file.
- Parsing mode, repair level, indentation, sample, schema rules, and Pro actions where available.
- JP/EN UI selection.
- Current legacy shared NicheWorks Pro entitlement state.

## Outputs

- Validation result and explanation.
- Repaired, pretty, or minified JSON text.
- Repair log and simple diff.
- Free copy/normal JSON download.
- Pro candidate/schema/history/report/advanced-export outputs when legacy entitlement is active.

## State and persistence

Current input/results are page-session state. Pro history is browser-local when available. Legacy shared Pro state is browser-local through the common NicheWorks mechanism and is migration-only authority, not future server-verified purchase proof. User-triggered downloads are saved locally.

## Privacy and network behavior

JSON validation and repair run in the browser and input text is not intentionally uploaded by the repair workflow. Advertising, analytics, and shared Pro resources may load independently.

Billing/entitlement migration must use fixed product/feature metadata only. JSON input, repaired/formatted/minified content, candidates, schema rules/results, repair logs, diffs, history, reports, export payloads/filenames, and any values/keys/identifiers/credentials/URLs/personal/confidential data derived from user input must not enter billing or entitlement requests.

## Product-scoped migration staging

`MONETIZATION_CLASSIFICATION_87.md` classifies `json-repair` as an approved `PRO_BUNDLE` member. Its future shared product authority is `nicheworks.pro`; legacy `nicheworks_pro` is compatibility/migration state only.

`tools/json-repair/product-scoped-controller.mjs` stages exactly six operations:

1. `aggressiveRepair`
2. `candidateActions`
3. `schemaCheck`
4. `history`
5. `reportExport`
6. `proSamples`

The staged wrapper requires an explicit configured product ID and complete unique feature map, delegates server verification to `assets/nw-product-scoped-controller.mjs`, and fails closed for wrong-product, local-only, unverified, incomplete/duplicate mapping, or entitlement-refresh failure states.

For live migration, the configured product ID must be `nicheworks.pro` plus the approved JSON Repair feature mapping. The wrapper is a non-live migration/test adapter and does not imply a separate JSON Repair product.

The historical `$2.99` UI copy and shared Payment Link are legacy commerce evidence only. They do not authorize the future NicheWorks Pro price. No price/currency, Stripe Product/Price, price tier, production feature IDs, restore/account policy, historical-purchaser treatment, or live/test rollout is authorized by this contract.

## Language mode

`bilingual single-page`

JP/EN controls switch the same JSON workbench.

## Layout class

`pc-oriented`

The paired input/output editors, tabs, diff/log, schema, history, and report panels are information-dense and benefit from desktop width.

## Limits and non-goals

- Repair is heuristic and cannot guarantee preservation of intended data semantics.
- Aggressive repair can make stronger assumptions and remains explicitly separate/gated.
- Simple schema checking is not a full JSON Schema implementation.
- The tool does not execute code embedded in JSON-like input.
- Product-scoped staging does not launch billing or change current repair algorithms.

## Acceptance criteria

- [ ] Valid/invalid JSON can be checked and syntax failure is surfaced without executing input content.
- [ ] Safe/Standard repair, Pretty, Minify, copy, normal `.json` download, repair log, simple diff, and Free samples remain available without Pro.
- [ ] Aggressive repair, interactive candidate actions, schema check, history, report/advanced export, and Pro samples remain the exact paid value boundaries.
- [ ] Current legacy Pro requires both active state and exact `nicheworks_pro`; missing/unrelated entitlement cannot unlock.
- [ ] The staged product-scoped wrapper represents exactly the six paid operations and fails closed unless server-verified state matches the configured product/features.
- [ ] Canonical monetization classification is `PRO_BUNDLE`, and future live product authority is shared `nicheworks.pro` rather than a tool-specific product.
- [ ] Billing/entitlement traffic contains no JSON or generated user content.
- [ ] JP/EN switching preserves the same repair levels and privacy warning.

## Implementation evidence

- `tools/json-repair/index.html`
- `tools/json-repair/app.js`
- `tools/json-repair/product-scoped-controller.mjs`
- `scripts/check-json-repair-product-scoped-staging.mjs`
- `MONETIZATION_CLASSIFICATION_87.md`
- `docs/billing/pro-product-contracts-wave7.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
