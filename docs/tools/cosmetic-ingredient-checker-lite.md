# Cosmetic Ingredient Checker Lite — canonical tool specification

- **Slug:** `cosmetic-ingredient-checker-lite`
- **Display name (JA):** 化粧品成分チェック Lite
- **Display name (EN):** Cosmetic Ingredient Checker Lite
- **Implementation:** `tools/cosmetic-ingredient-checker-lite/`
- **Registry state:** active (registered implementation present)
- **Category:** cosmetic, ingredients, inci, beauty
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `cosmetic-ingredient-checker-lite` implementation at `/tools/cosmetic-ingredient-checker-lite/`. It does not authorize a production rewrite.

## 2. Purpose

Parse a pasted cosmetic ingredient list and show lightweight ingredient flags and explanatory notes as a reference aid, without presenting medical, diagnostic, or regulatory conclusions.

## 3. Inputs

- Pasted cosmetic ingredient-list text.
- Check, clear, and copy actions.

## 4. Processing behavior

- Accept ingredient text containing INCI names, Japanese names, or a mixture separated by commas, Japanese commas, or line breaks.
- Parse ingredients in input order and classify implemented ingredient patterns into simple caution/reference flags such as fragrance, preservative, alcohol, and related categories.
- Show parsed-item count, summary groups, simple consideration prompts, and a row-per-ingredient table with flag and note.
- Support clear/reset and copying the current result.
- Present explicit information-only and non-diagnostic disclaimers.

## 5. Outputs

- Parsed ingredient count.
- Summary/category indicators and consideration prompts.
- Ingredient table containing name, simple flag, and explanatory note.
- Clipboard copy of the current result.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Ingredient parsing runs in the browser. The pasted ingredient text is not intentionally uploaded by the checker workflow. Suite-wide advertising and analytics resources may load separately.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The primary interaction is a single text input followed by summary and result table content; the workflow is intended to remain usable on narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `Japanese-only`.
- The current UI explicitly labels itself Japanese-only. English UI must not be added merely to satisfy a suite-wide default unless the product contract is intentionally changed.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/cosmetic-ingredient-checker-lite/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **missing**.

## 14. Functional acceptance tests

- [ ] A comma-, Japanese-comma-, or line-break-separated ingredient list is parsed in input order and produces a result count/table.
- [ ] Implemented recognized ingredients can receive the corresponding simple flag/note while unknown items remain non-authoritative rather than fabricated diagnoses.
- [ ] Clear removes the current working result and copy uses the currently generated result.
- [ ] The page remains explicitly Japanese-only and retains the medical/regulatory disclaimer.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- Japanese-only is an explicit tool-specific language exception.
- No additional layout exception is established.

### Implementation evidence

- `tools/cosmetic-ingredient-checker-lite/index.html`
- `tools/cosmetic-ingredient-checker-lite/app.js`
- `tools/cosmetic-ingredient-checker-lite/style.css`
