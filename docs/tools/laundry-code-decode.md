# Laundry Code Decode — canonical tool specification

- **Slug:** `laundry-code-decode`
- **Display name (JA):** 洗濯表示コード読み解き
- **Display name (EN):** Laundry Code Decode
- **Implementation:** `tools/laundry-code-decode/`
- **Registry state:** active (registered implementation present)
- **Category:** laundry, clothing, symbols, life
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `laundry-code-decode` implementation at `/tools/laundry-code-decode/`. It does not authorize a production rewrite.

## 2. Purpose

Explain common laundry-care symbols by category and provide an experimental browser-side photo candidate search, while requiring users to prioritize the actual garment label and professional guidance.

## 3. Inputs

- Category, search text, and all-category toggle.
- Symbol selection.
- Optional local image and photo-candidate category scope.
- JP/EN UI selection.

## 4. Processing behavior

- Browse/search common care symbols across Wash, Bleach, Dry, Iron, and Dry Clean categories.
- Search the current category or all categories by keyword and open a selected symbol's Japanese/English meaning and detail.
- Copy the selected symbol result.
- Provide an experimental photo candidate search for PNG, JPEG, WebP, and GIF images up to the implemented 10 MB limit.
- Compare the selected image appearance with SVG symbol templates and return candidate matches/scores in the browser.
- Explicitly state that the photo feature is not OCR and not an accurate automatic symbol reader.
- Provide JP/EN UI and reference-only safety guidance.

## 5. Outputs

- Symbol meaning/detail and copyable result.
- Experimental image-comparison candidate list and reference scores.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/laundry-code-decode/app.js`, `tools/laundry-code-decode/howto/en/index.html`, `tools/laundry-code-decode/howto/index.html`, `tools/laundry-code-decode/index.html`.

## 7. Privacy/data handling

Symbol lookup and photo-candidate comparison run in the browser and the selected image is not intentionally uploaded by that workflow. Suite-wide advertising and analytics resources may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- Care-symbol grids, search, image candidate controls, and result card are designed for tap-oriented narrow-screen use.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same symbol lookup and experimental photo workflow.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/laundry-code-decode/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Browsing/searching a known symbol returns the implemented bilingual meaning/detail and supports copying the selected result.
- [ ] A supported image within the size limit can run the experimental local candidate search without being described as OCR.
- [ ] Candidate scores remain explicitly reference-only and require manual user confirmation.
- [ ] JP/EN switching preserves categories, search, photo-candidate controls, and safety disclaimer.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/laundry-code-decode/index.html`
- `tools/laundry-code-decode/app.js`
- `tools/laundry-code-decode/style.css`
