# Design Request Builder — canonical tool specification

- **Slug:** `design-request-builder`
- **Display name (JA):** デザイン依頼文ジェネレーター
- **Display name (EN):** Design Request Builder
- **Implementation:** `tools/design-request-builder/`
- **Registry state:** active (registered implementation present)
- **Category:** design, brief, request, template
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `design-request-builder` implementation at `/tools/design-request-builder/`. It does not authorize a production rewrite.

## 2. Purpose

Turn structured design-project requirements into a reviewable production brief so clients and creators can clarify deliverables, schedule, budget, references, constraints, revisions, and handoff conditions before work starts.

## 3. Inputs

- Project type, purpose, deliverables, deadline, and budget.
- Optional/recommended size, references, assets, audience, tone, constraints, delivery format, revisions, contact, and other project notes.
- Output tier and UI language.

## 4. Processing behavior

- Collect required project type, purpose, deliverables, deadline, and budget.
- Collect recommended/optional information including size/specs, references/assets, must-have items, audience, tone, avoided expressions, constraints, delivery format, revision count, and contact.
- Display readiness/missing-field status before generation.
- Support short, standard, and detailed output tiers.
- Generate a design-request/production brief from the entered fields in the browser.
- Provide JP/EN UI and generated-copy/export actions implemented by the current tool.
- Keep copyright, asset permission, commercial-use scope, extra fees, and portfolio permission as matters for the parties to confirm rather than silently deciding them.

## 5. Outputs

- Readiness/missing-field guidance.
- Structured design brief/request text in the selected level of detail.
- Current copy/download outputs provided by the implementation.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Invalid or unsupported input:** The implementation has no separate unsupported-input mode beyond its current controls and validation path; that observed path is canonical.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/design-request-builder/app.js`, `tools/design-request-builder/index.html`.

## 7. Privacy/data handling

Brief generation runs in the browser. The page may load advertising and analytics resources separately, so users are warned to mask confidential project names, internal URLs, private contacts, and unreleased asset locations.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The tool is primarily a long structured form and output block that can be used as a single-column workflow on narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same form and generated brief experience.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/design-request-builder/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Missing required fields are surfaced before a complete-ready state is shown.
- [ ] Supplying required fields produces a brief whose level of detail follows the selected short/standard/detailed tier.
- [ ] Optional project constraints and delivery/revision information are preserved when included in the generated brief.
- [ ] JP/EN switching retains the same form requirements and contract/permission disclaimers.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/design-request-builder/index.html`
- `tools/design-request-builder/app.js`
- `tools/design-request-builder/style.css`
