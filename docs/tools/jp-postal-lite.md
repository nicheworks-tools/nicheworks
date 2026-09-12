# JP Postal Lite — canonical tool specification

- **Slug:** `jp-postal-lite`
- **Display name (JA):** 郵便番号・住所補助 Lite
- **Display name (EN):** JP Postal Lite
- **Implementation:** `tools/jp-postal-lite/`
- **Registry state:** active (registered implementation present)
- **Category:** postal, japan, address, life
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `jp-postal-lite` implementation at `/tools/jp-postal-lite/`. It does not authorize a production rewrite.

## 2. Purpose

Search Japanese postal-code reference data by prefecture and partial address, collect selected matches, and export a small CSV for follow-up work while requiring official confirmation for important uses.

## 3. Inputs

- Prefecture selection.
- Partial Japanese address query.
- Result-row actions and output-list management.

## 4. Processing behavior

- Load the tool's own `./data/*.json` postal datasets for all supported prefectures; the current implementation does not automatically fall back to an external backup JSON service.
- Require a prefecture and at least two address characters, with light normalization for full-width digits/spaces and hyphen variants.
- Return up to 50 matching postal-code/address candidates and show data-load failures rather than treating empty/corrupt data as valid.
- Allow result rows to be copied or added to an output list.
- Allow output-list rows to be removed/cleared and download `postal_code,address` CSV.
- Display dataset coverage/check-date information without claiming that the NicheWorks check date is the official address-change effective date.

## 5. Outputs

- Matching postal-code/address candidates.
- Selected output list.
- User-triggered CSV download.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Network/API failure:** Implemented response checks, rejection handling, timeout/abort logic, or catch paths expose the unavailable/error state; remote failure is not replaced with fabricated remote data.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/jp-postal-lite/app.js`, `tools/jp-postal-lite/howto/en/index.html`, `tools/jp-postal-lite/howto/index.html`, `tools/jp-postal-lite/index.html`.

## 7. Privacy/data handling

Search processing and output-list construction run in the browser using NicheWorks-hosted local JSON datasets. The address query is not intentionally submitted to an application search backend. Advertising and analytics resources may load separately.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`, `www.post.japanpost.jp`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- Prefecture/query controls, result cards, and output list are designed as a stacked lookup workflow usable on narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `Japanese-only`.
- The tool is specifically for Japanese addresses/postal codes and the current UI is Japanese-only.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/jp-postal-lite/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Selecting a loaded prefecture and entering at least two address characters returns matching bundled-data candidates or a clear no-result/load-error state.
- [ ] Result rows can be added to and removed from the output list without modifying source postal data.
- [ ] CSV download contains the selected rows in `postal_code,address` form.
- [ ] The UI keeps the official-information disclaimer and does not claim external backup JSON retrieval.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test), `tools/jp-postal-lite/scripts/build-postal-data.mjs` (build script). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- Japanese-only is an explicit tool-specific language exception.
- No additional layout exception is established.

### Implementation evidence

- `tools/jp-postal-lite/index.html`
- `tools/jp-postal-lite/app.js`
- `tools/jp-postal-lite/style.css`
