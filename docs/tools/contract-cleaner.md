# Contract Cleaner — canonical tool specification

- **Slug:** `contract-cleaner`
- **Display name (JA):** 契約書クリーナー
- **Display name (EN):** Contract Cleaner
- **Implementation:** `tools/contract-cleaner/`
- **Registry state:** active (registered implementation present)
- **Category:** contract, text, clean, legal
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `contract-cleaner` implementation at `/tools/contract-cleaner/`. It does not authorize a production rewrite.

## 2. Purpose

Mechanically scan pasted contract or terms text for implemented attention keywords and categories, then organize review points and questions without making legal conclusions.

## 3. Inputs

- Pasted contract, terms, or agreement text.
- Matched-only filter toggle.
- Example/clear/analyze actions.
- UI language selection.

## 4. Processing behavior

- Accept pasted contract/terms text and detect implemented attention words across categories such as damages, termination, payment, intellectual property, confidentiality, and related review areas.
- Show total matches, matched-category count, High/Medium/Low review-priority counts, prioritized categories, category-level review points, and highlighted matched text.
- Support a matched-categories-only view.
- Generate/copy a summary and review-question template and save a text output.
- Provide example text and clear/reset behavior.
- Switch the same tool between Japanese and English.
- State that severity is a review-priority signal, not a legal risk determination.

## 5. Outputs

- Match totals, category counts, priority/severity counts, category cards, highlighted excerpts, and review-question preview.
- Clipboard copies of summary/question material.
- User-triggered TXT download.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/contract-cleaner/app.js`, `tools/contract-cleaner/howto/en/index.html`, `tools/contract-cleaner/howto/index.html`, `tools/contract-cleaner/index.html`.

## 7. Privacy/data handling

Contract analysis runs in the browser and the pasted text is not intentionally submitted to an application backend by the checker. Suite-wide analytics and advertising may load separately. Users are explicitly warned not to paste sensitive contracts or personal information unnecessarily.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The input/result panels benefit from desktop width, while the text-first workflow can stack for narrow-screen use.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch labels, notices, and review copy on the same tool page.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/contract-cleaner/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Pasting text containing supported attention terms and running analysis produces category findings and highlighted matches.
- [ ] Match/severity summaries correspond to the current analyzed text and the matched-only toggle changes category visibility without altering source text.
- [ ] Summary/question copy and TXT save operate on generated review material rather than claiming legal conclusions.
- [ ] JP/EN switching preserves analysis behavior and the legal/non-authoritative disclaimer.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/contract-cleaner/index.html`
- `tools/contract-cleaner/app.js`
- `tools/contract-cleaner/style.css`
