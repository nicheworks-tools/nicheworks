# JSON Repair — canonical tool specification

- **Slug:** `json-repair`
- **Display name (JA):** JSON修復ツール
- **Display name (EN):** JSON Repair
- **Implementation:** `tools/json-repair/`
- **Registry state:** active (registered implementation present)
- **Category:** json, repair, developer, format
- **Common specification:** `common-spec/spec-ja.md`
- **Monetization class:** `PRO_BUNDLE`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `json-repair` implementation at `/tools/json-repair/`. It does not authorize a production rewrite or live billing launch.

## 2. Purpose

Validate, format, minify, and repair common broken-JSON cases in the browser, with stronger repair, candidate/schema/history, and report tooling gated behind NicheWorks Pro.

## 3. Inputs

- JSON/JSONC-like text or local `.json` / text file.
- Parsing mode, repair level, indentation, sample, schema rules, and Pro actions where available.
- JP/EN UI selection.
- Current legacy shared NicheWorks Pro entitlement state.

## 4. Processing behavior

- Accept pasted or loaded `.json` / text input and support Auto, JSON, and JSONC interpretation modes.
- Validate syntax and show error/explanation information.
- Free mode provides Safe and Standard repair, including automatic extraction of one likely JSON candidate from mixed log text.
- Free mode provides Pretty/Minify, repaired/formatted/validate tabs, repair log, simple diff, copy, normal `.json` download, and current Free samples.
- The current legacy shared-Pro surface has six paid value boundaries: Aggressive repair; interactive candidate Use/Repair; simple required/type schema check; local repair history; repair report/Markdown/JSON advanced export; and Pro samples.
- Current legacy Pro activation requires both `status.active === true` and exact entitlement `nicheworks_pro`; missing or unrelated entitlement state is not authoritative.
- The active legacy Pro integration is embedded in `app.js`; the product-scoped controller remains non-live staging.
- Switch the same interface between Japanese and English.

## 5. Outputs

- Validation result and explanation.
- Repaired, pretty, or minified JSON text.
- Repair log and simple diff.
- Free copy/normal JSON download.
- Pro candidate/schema/history/report/advanced-export outputs when the current legacy entitlement is active.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** Implemented guard clauses/validation use current visible feedback and do not fabricate successful output.
- **Unsupported or over-limit input:** Current controls and parser/repair paths determine accepted input; no hidden fallback contract is implied.
- **Parse or local-file failure:** Existing exception/error paths surface failure and do not label a failed operation successful.
- **External/network failure:** Not applicable to the core local JSON workflow; suite analytics, advertising, and entitlement resources are not result fallbacks.
- **Copy/download failure:** Current browser operation behavior applies; downloads are produced only from the current generated result.
- **Paid-action failure/absence:** Inactive or non-matching legacy entitlement state leaves all current Free validation/repair/format/copy/download behavior usable while paid operations remain locked.
- **Safe fallback/reset:** Current reset restores working defaults and clears derived result state.
- **Runtime evidence inspected:** `tools/json-repair/app.js`, `tools/json-repair/index.html`.

## 7. Privacy/data handling

JSON validation and repair run in the browser and input text is not intentionally uploaded by the repair workflow. Advertising, analytics, and shared Pro resources may load independently.

Persistence evidence: browser `localStorage`, including current Pro history when active. Network-capable application code for JSON repair: **not found**; non-suite hosts observed include the historical Stripe Payment Link and support links.

Product-scoped billing/entitlement migration may contain fixed product/feature metadata only. It must not include JSON input, repaired/formatted/minified content, candidates, schema rules/results, repair logs, diffs, history, report/export content or filenames, or any values/keys/identifiers/credentials/URLs/personal/confidential data derived from user input.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The paired input/output editors, tabs, diff/log, schema, history, and report panels are information-dense and benefit from desktop width.
- Preserve the functional width class and common-spec responsive rules; do not force an arbitrary universal narrow layout.
- Current audit: no concrete responsive defect was established by static inspection.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same JSON workbench.
- Existing languages must not be removed.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/json-repair/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `optional-absent`. No current usage page is implementation evidence.
- **FAQ:** `optional-present`.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any future usage link must remain subdued and separated from advertising per common-spec section 10-6.

## 14. Monetization and entitlement contract

`MONETIZATION_CLASSIFICATION_87.md` classifies `json-repair` as an approved `PRO_BUNDLE` member. Its future paid product authority is the shared `nicheworks.pro` product; legacy `nicheworks_pro` remains compatibility/migration state only.

Current Free behavior is fixed: input/file load, validation, Safe/Standard repair, automatic likely-candidate extraction inside Standard repair, Pretty/Minify, result tabs, log/diff, copy, normal `.json` download, and Free samples remain available without paid entitlement.

The exact additive paid value boundaries are:

1. `aggressiveRepair`
2. `candidateActions`
3. `schemaCheck`
4. `history`
5. `reportExport`
6. `proSamples`

`reportExport` includes report copy and Markdown/JSON advanced export as delivery variants of one report/export surface. Interactive candidate actions are paid, while Standard Free repair may continue automatically extracting one likely candidate. Simple schema checking is not represented as full JSON Schema support.

The public runtime remains on the hardened legacy shared-Pro mechanism until the shared bundle is commercially configured and this migration wave is authorized. `tools/json-repair/product-scoped-controller.mjs` is staging only and delegates future server verification to `assets/nw-product-scoped-controller.mjs`.

For live migration, the configured product ID must be `nicheworks.pro` plus the approved JSON Repair feature mapping. No JSON-Repair-specific paid product is created by this contract.

The historical `$2.99` copy and shared Payment Link are legacy commerce evidence only, not future price authority. NicheWorks Pro price/currency, Stripe Product/Price, price tier, production feature IDs, restore/account policy, historical-purchaser treatment, and live/test rollout remain unresolved. Detailed staging requirements are in `docs/billing/pro-product-contracts-wave7.md`.

## 15. Functional acceptance tests

- [ ] Valid/invalid JSON can be checked and syntax failure is surfaced without executing input content.
- [ ] Safe/Standard repair, Pretty, Minify, copy, normal `.json` download, repair log, simple diff, and Free samples remain available without Pro.
- [ ] Aggressive repair, interactive candidate actions, schema check, history, report/advanced export, and Pro samples remain the exact paid value boundaries.
- [ ] Current legacy Pro requires both active state and exact `nicheworks_pro`; missing/unrelated entitlement state cannot unlock.
- [ ] Product-scoped staging fails closed unless server-verified state matches the configured product and returned mapped features.
- [ ] Canonical monetization classification is `PRO_BUNDLE`, and future live product authority is `nicheworks.pro` rather than a tool-specific product.
- [ ] Billing/entitlement traffic contains no JSON or generated user content.
- [ ] JP/EN switching preserves the same repair levels and privacy warning.

Automated regression/source-contract evidence: `scripts/check-tool-runtime-contracts.mjs` and `scripts/check-json-repair-product-scoped-staging.mjs`. The dedicated staging check is not represented as a full browser E2E test. Browser behavior-level status remains **behavior-test-missing** until an actual browser scenario test is added.

## 16. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary workspace into an arbitrary fixed narrow width.
- The historical `$2.99` display is legacy commerce copy and must not be used as future price truth.

### Implementation evidence

- `tools/json-repair/index.html`
- `tools/json-repair/app.js`
- `tools/json-repair/product-scoped-controller.mjs`
- `scripts/check-json-repair-product-scoped-staging.mjs`
- `MONETIZATION_CLASSIFICATION_87.md`
- `docs/billing/pro-product-contracts-wave7.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
