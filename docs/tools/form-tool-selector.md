# Form Tool Selector — canonical tool specification

- **Slug:** `form-tool-selector`
- **Display name (JA):** フォームツール選定補助
- **Display name (EN):** Form Tool Selector
- **Implementation:** `tools/form-tool-selector/`
- **Registry state:** active (registered implementation present)
- **Category:** form, tool, selector, planning
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `form-tool-selector` implementation at `/tools/form-tool-selector/`. It does not authorize a production rewrite.

## 2. Purpose

Translate basic form requirements into candidate form-tool categories and a decision memo so users know what capabilities and risks to compare before choosing an actual service.

## 3. Inputs

- Capability and priority checkboxes.
- Quick-start action.
- JP/EN UI selection.

## 4. Processing behavior

- Accept requirement toggles for file uploads, payments/billing, notifications/integrations, and multilingual forms.
- Accept priority toggles such as free-first and privacy-first.
- Generate candidate form-tool types/categories from the selected requirements rather than recommending a named provider.
- Generate a handoff/decision memo with checks users should perform on real services.
- Provide a quick-start sample and copy/save outputs as text and Markdown where implemented.
- Store selected display language in browser localStorage as implemented.
- Warn users to verify pricing, storage, terms, personal-data handling, upload limits, payment conditions, and integrations directly with providers.

## 5. Outputs

- Candidate form-tool types/categories.
- Decision/handoff memo and verification checklist.
- Clipboard copy plus TXT/Markdown downloads.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/form-tool-selector/app.js`, `tools/form-tool-selector/index.html`.

## 7. Privacy/data handling

Candidate selection logic runs in the browser. Advertising and analytics resources may load separately; users are warned to mask unreleased service names, internal URLs, customer names, personal data, and confidential requirements.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The checkbox groups, result list, and memo are a stacked decision-support flow suitable for narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same selector and decision memo experience.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/form-tool-selector/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Selecting different requirement combinations changes the generated candidate types/checks according to the implemented rules.
- [ ] Results do not present a named form vendor as automatically recommended or certified.
- [ ] Copy/TXT/Markdown outputs reflect the current candidate result and decision memo.
- [ ] JP/EN switching preserves the same requirements and provider-verification warnings.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/form-tool-selector/index.html`
- `tools/form-tool-selector/app.js`
- `tools/form-tool-selector/style.css`
