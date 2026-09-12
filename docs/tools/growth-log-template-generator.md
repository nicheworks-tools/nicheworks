# Growth Log Template Generator — canonical tool specification

- **Slug:** `growth-log-template-generator`
- **Display name (JA):** 成長ログテンプレート生成
- **Display name (EN):** Growth Log Template Generator
- **Implementation:** `tools/growth-log-template-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** growth, log, template, habit
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `growth-log-template-generator` implementation at `/tools/growth-log-template-generator/`. It does not authorize a production rewrite.

## 2. Purpose

Turn KPI notes, hypotheses, learnings, and freeform notes into a structured growth-log draft for internal or public reporting, with privacy-oriented controls before publishing.

## 3. Inputs

- Preset selection and its KPI values.
- Hypothesis, learnings, and notes.
- Anonymization toggle and bilingual-output toggle.
- UI language selection.

## 4. Processing behavior

- Provide SEO, Product, Sales, and Content presets with preset-specific KPI fields.
- Accept hypothesis, learnings, and notes alongside the selected KPI inputs.
- Generate a structured growth log and rule-based next-action suggestions in the browser.
- Support optional number anonymization by replacing numeric substrings in user-entered KPI values, hypotheses, learnings, and notes with `XXX` while leaving non-numeric text visible.
- Support optional bilingual JP+EN output.
- Provide example insertion/sample generation, clipboard copy, Markdown download, and TXT download.
- Warn users to review revenue, conversion, DAU/WAU, ad metrics, customer information, internal initiatives, and tentative KPIs before publishing.

## 5. Outputs

- Structured growth-log draft.
- Rule-based next-action suggestions.
- Copied output and Markdown/TXT downloads.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Growth-log generation runs in the browser. Advertising and analytics resources may load separately. The anonymization option is only a simple numeric replacement aid and does not guarantee that a log is safe to publish; names, project labels, strategies, identifiers, and other non-numeric context remain unless the user removes them.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The primary flow is a preset-driven input form followed by a generated text output and publishing caution block.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The tool UI switches JP/EN in place and can additionally generate a bilingual output when requested.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/growth-log-template-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Each supported preset renders its corresponding KPI inputs and can generate a structured log.
- [ ] Enabling number anonymization replaces numeric substrings in KPI values, hypothesis, learnings, and notes with `XXX` without claiming complete de-identification or hiding ordinary non-numeric text.
- [ ] Bilingual output, copy, Markdown, and TXT actions use the current generated draft.
- [ ] JP/EN modes preserve the publication/privacy warnings and the rule-based nature of next actions.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/growth-log-template-generator/index.html`
- `tools/growth-log-template-generator/app.js`
- `tools/growth-log-template-generator/style.css`
