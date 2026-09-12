# Moving Checklist Generator — canonical tool specification

- **Slug:** `moving-checklist-generator`
- **Display name (JA):** 引越しチェックリスト生成
- **Display name (EN):** Moving Checklist Generator
- **Implementation:** `tools/moving-checklist-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** moving, checklist, life, home
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `moving-checklist-generator` implementation at `/tools/moving-checklist-generator/`. It does not authorize a production rewrite.

## 2. Purpose

Generate a chronological moving checklist from a move date and household/home conditions, with browser-local completion tracking and print/PDF support.

## 3. Inputs

- Move date.
- Household: solo or family.
- Home type: rental or owned.
- Optional 40-character print memo.
- Checklist completion toggles.

## 4. Processing behavior

- Accept move date, household type (`solo` or `family`), and home type (`rental` or `owned`).
- Accept an optional print-only memo up to 40 characters.
- Generate reference tasks spanning preparation before the move through post-move follow-up.
- Track completion state and show progress for the current condition set.
- Save checkbox state keyed by the identifying conditions: move date, household type, and home type.
- Do not persist the optional print memo.
- Allow clearing checks, resetting form inputs, deleting the current condition's saved data, and deleting all saved checklist data.
- Use browser print for paper output or user-selected PDF save.
- Switch JP/EN UI.

## 5. Outputs

- Chronological checklist.
- Progress/completion summary.
- Print-friendly checklist including the optional memo when provided.
- Browser print/PDF flow.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** No dedicated recovery branch is implemented; a failed read/parse produces no successful derived output. This current limitation is recorded rather than converted into a product decision.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/moving-checklist-generator/app.js`, `tools/moving-checklist-generator/howto/en/index.html`, `tools/moving-checklist-generator/howto/index.html`, `tools/moving-checklist-generator/index.html`.

## 7. Privacy/data handling

Checklist generation and completion tracking are browser-side. The optional memo and moving conditions are not sent to a checklist backend. Ads/analytics can load independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The core interaction is a compact form followed by a chronological checklist; a dedicated print presentation is provided.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The implemented `bilingual single-page` mode above is the canonical language behavior; repository HTML/JavaScript establishes the switching or page-separation mechanism.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/moving-checklist-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-present`. Evidence: `tools/moving-checklist-generator/usage-en.html`, `tools/moving-checklist-generator/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] A valid move date plus household/home type produces a condition-specific checklist and progress state.
- [ ] Checkbox state survives reload for the same condition set but does not leak to a different condition set.
- [ ] The optional print memo is not written to persistent storage.
- [ ] Delete-current and delete-all actions remove the corresponding saved checklist state.
- [ ] Print/PDF uses the browser print flow and does not claim server-generated PDF storage.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/moving-checklist-generator/index.html`
- `tools/moving-checklist-generator/app.js`
- `tools/moving-checklist-generator/style.css`
- `tools/moving-checklist-generator/usage-en.html`
- `tools/moving-checklist-generator/usage.html`
