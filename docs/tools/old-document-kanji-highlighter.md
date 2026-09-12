# Old Document Kanji Highlighter — canonical tool specification

- **Slug:** `old-document-kanji-highlighter`
- **Display name (JA):** 古文書旧字体ハイライター｜Old Document Kanji Highlighter
- **Display name (EN):** Old Document Kanji Highlighter
- **Implementation:** `tools/old-document-kanji-highlighter/`
- **Registry state:** active (registered implementation present)
- **Category:** old, document, kanji, highlighter
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `old-document-kanji-highlighter` implementation at `/tools/old-document-kanji-highlighter/`. It does not authorize a production rewrite.

## 2. Purpose

Highlight registered old/variant kanji in pasted historical-style text and provide a mechanical modern-form reference without claiming translation or scholarly interpretation.

## 3. Inputs

- Pasted text.
- JP/EN display selection.

## 4. Processing behavior

- Accept pasted text such as old documents, inscriptions, map descriptions, or sign text.
- Detect characters found in the local Old Kanji reference mapping.
- Highlight detected old forms in the original text.
- Show a detected-character list and old→modern correspondence.
- Produce a mechanical modern-form preview.
- Allow copying detected old forms, the pair table, and the modern-form preview.
- Link to related Old Kanji tools for deeper lookup/conversion.
- Process text locally and load reference data from same-site assets.
- Display Old Kanji Toolkit Pro as billing-unavailable; batch/report/export/saved-set/audit capabilities are locked because billing is not connected.

## 5. Outputs

- Highlighted source text.
- Detected old/variant-character list.
- Old→modern correspondence.
- Mechanical modern-form preview.
- Clipboard outputs for detected forms, pairs, and preview.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- [ ] Billing-unavailable Pro controls remain locked and must not be described as currently purchasable functionality.

## 7. Privacy/data handling

Text analysis is performed in the browser and is not sent to an external analysis API. Same-site reference assets are loaded as needed; ads/analytics can load independently.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- Long source documents benefit from desktop width, while the input/results are vertically usable on mobile.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/old-document-kanji-highlighter/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **missing**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **missing**.

## 14. Functional acceptance tests

- [ ] Registered old forms in pasted text are highlighted and represented in the detected list.
- [ ] The modern preview is clearly labeled as mechanical replacement rather than authoritative modernization.
- [ ] Copy actions operate on locally derived detection/pair/preview data.
- [ ] Pasted document text is not sent to an external analysis API.
- [ ] Billing-unavailable Pro controls remain locked and must not be described as currently purchasable functionality.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/old-document-kanji-highlighter/index.html`
- `tools/old-document-kanji-highlighter/app.js`
- `tools/old-document-kanji-highlighter/style.css`
