# JSON Repair — canonical tool specification

- **Slug:** `json-repair`
- **Display name (JA):** JSON修復ツール
- **Display name (EN):** JSON Repair
- **Implementation:** `tools/json-repair/`
- **Registry state:** active (registered implementation present)
- **Category:** json, repair, developer, format
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `json-repair` implementation at `/tools/json-repair/`. It does not authorize a production rewrite.

## 2. Purpose

Validate, format, minify, and repair common broken-JSON cases in the browser, with stronger repair, candidate/schema/history, and report tooling gated behind shared NicheWorks Pro.

## 3. Inputs

- JSON/JSONC-like text or local `.json` / text file.
- Parsing mode, repair level, indentation, sample, schema rules, and Pro actions where available.
- JP/EN UI selection and shared Pro entitlement state.

## 4. Processing behavior

- Accept pasted or loaded `.json` / text input and support Auto, JSON, and JSONC interpretation modes.
- Validate syntax and show error/explanation information.
- Provide free Safe and Standard repair levels for supported issues such as trailing commas, comments, and log-mixed JSON.
- Provide Pretty and Minify formatting, repaired/formatted/validate result tabs, repair log, simple diff, copy, and `.json` download in free mode.
- Keep Aggressive repair and related single-quote, unquoted-key, Python-literal examples gated by Pro.
- With active Pro, expose repair candidates, simple schema rules/checking, local repair history, report generation, Markdown export, and JSON export.
- The active Pro integration is implemented directly in `app.js`, which reads the shared `NWPro` status loaded by the public page; there is no tool-local `pro-bridge.js` in the current runtime.
- Switch the same interface between Japanese and English.

## 5. Outputs

- Validation result and explanation.
- Repaired, pretty, or minified JSON text.
- Repair log and simple diff.
- Free copy/JSON download plus Pro candidate/schema/history/report and Markdown/JSON export outputs.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** No additional clipboard failure policy is implemented beyond the browser operation. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/json-repair/app.js`, `tools/json-repair/index.html`.

## 7. Privacy/data handling

JSON validation and repair run in the browser and input text is not intentionally uploaded by the repair workflow. Advertising, analytics, and shared Pro resources may load independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The paired input/output editors, tabs, diff/log, schema, history, and report panels are information-dense and benefit from desktop width.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same JSON workbench.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/json-repair/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-absent`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Valid/invalid JSON can be checked and syntax failure is surfaced without executing input content.
- [ ] Safe/Standard repair, Pretty, Minify, copy, download, log, and simple diff remain available in free mode.
- [ ] Aggressive repair and candidate/schema/history/report/export features remain gated by shared Pro state.
- [ ] JP/EN switching preserves the same repair levels and privacy warning.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/json-repair/index.html`
- `tools/json-repair/app.js`
- `tools/json-repair/style.css`
