# Old Kanji Reference — canonical tool specification

- **Slug:** `old-kanji-reference`
- **Display name (JA):** 旧字体一覧・旧字新字対応表
- **Display name (EN):** Old Kanji Reference
- **Implementation:** `tools/old-kanji-reference/`
- **Registry state:** active (registered implementation present)
- **Category:** kanji, old-kanji, japanese, reference
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `old-kanji-reference` implementation at `/tools/old-kanji-reference/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a searchable bilingual reference for old Japanese kanji forms and their modern equivalents, including selected metadata, text detection, local study state, and export utilities.

## 3. Inputs

- Search query and search-mode selection.
- Category/status/display filters.
- Pasted detector text.
- Favorite/recent/detail interactions.
- Quiz mode, preset, and answers.
- JP/EN display language.

## 4. Processing behavior

- Load the bundled old→modern mapping plus metadata, shape/stroke/compatibility reference assets.
- Search by all fields or by old form, modern form, reading, meaning, or Unicode.
- Filter entries by verified status, metadata availability, names/places, common-use old forms, old documents, rare/reference, and pair-only records.
- Offer compact, detail, and table display modes.
- Show common/popular entries and richer reading/meaning/usage/Unicode data only where available rather than fabricating metadata for every pair.
- Detect registered old forms inside pasted text, highlight them, copy detected old forms/pairs, and send the full text to Kanji Modernizer through a query parameter.
- Maintain browser-local favorites, recent entries, display mode, and quiz statistics.
- Provide quiz modes for old→modern, modern→old, and reading→old using suitable verified data.
- Export the currently visible entries as CSV or JSON, copy a Markdown table, and invoke browser print.
- CSV, JSON, Markdown, and print export controls are currently Free and are not gated on Pro entitlement.
- The Old Kanji Toolkit Pro area is visibly marked billing-unavailable. Advanced learning-history and saved-set areas are described as planned/unavailable rather than purchasable current features.

## 5. Outputs

- Filtered old/modern kanji reference cards/table.
- Reading, meaning, usage, category, Unicode, rendering/compatibility detail when present.
- Text-detection highlight and pair results.
- CSV and JSON downloads of visible entries.
- Markdown table copy and browser print output.
- Quiz question/result/statistics UI.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- [ ] The disabled Pro panel communicates billing unavailable and does not present planned learning/saved-set features as currently purchasable.

## 7. Privacy/data handling

Search, detector, quiz, favorites, and export processing occur in the browser after same-site reference data loads. Detector/search input is not sent to an external kanji lookup service. Google Fonts, ads, analytics, and other page resources may load independently.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The dense searchable catalog, filters, detector, display modes, export controls, details, favorites/recent state, and quiz are best served by desktop width while remaining responsive.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/old-kanji-reference/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Search modes and filters operate on loaded reference data without inventing missing metadata.
- [ ] Detector text highlights registered old forms and supports copy/send-to-converter actions locally.
- [ ] Favorites, recent entries, display mode, and quiz statistics restore from their documented localStorage keys.
- [ ] CSV/JSON/Markdown/print actions remain functional without requiring Pro entitlement.
- [ ] Public JP/EN copy explicitly identifies the current export actions as Free and does not label them Pro-only.
- [ ] The disabled Pro panel communicates billing unavailable and does not present planned learning/saved-set features as currently purchasable.
- [ ] Reference results retain cautions appropriate to non-authoritative old/variant-kanji data.

Automated test evidence: `tools/old-kanji-reference/validate-compatibility-notes.js`, `tools/old-kanji-reference/validate-meta.js`, `tools/old-kanji-reference/validate-shape-notes.js`, `tools/old-kanji-reference/validate-stroke-counts.js`.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/app-meaning-v3.js`
- `tools/old-kanji-reference/app-meaning-v4.js`
- `tools/old-kanji-reference/app-meaning.js`
- `tools/old-kanji-reference/app.js`
- `tools/old-kanji-reference/style.css`
