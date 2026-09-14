# Old Kanji Reference — canonical tool specification

- **Slug:** `old-kanji-reference`
- **Display name (JA):** 旧字体一覧・旧字新字対応表
- **Display name (EN):** Old Kanji Reference
- **Implementation:** `tools/old-kanji-reference/`
- **Registry state:** active (registered implementation present)
- **Category:** kanji, old-kanji, japanese, reference
- **Common specification:** `common-spec/spec-ja.md`
- **Affiliate specification:** `common-spec/amazon-affiliate.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `old-kanji-reference` implementation at `/tools/old-kanji-reference/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a searchable bilingual reference for old Japanese kanji forms and their modern equivalents, including selected metadata, text detection, local study state, export utilities, and optional contextual Amazon search handoffs for physical reference tools.

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
- Dynamic shape/stroke detail sections must use the explicit card/grid rules in `amazon-layout.css`; they must not fall back to unstyled browser-default blocks.
- The Amazon resource panel builds fixed tagged Amazon.co.jp search URLs only for `旧字体 異体字 辞典`, `古文書 ルーペ`, and `書見台 ブックスタンド` using tracking ID `nicheworks09-22`.

## 5. Outputs

- Filtered old/modern kanji reference cards/table.
- Reading, meaning, usage, category, Unicode, rendering/compatibility detail when present.
- Shape/stroke detail cards when bundled data exists.
- Text-detection highlight and pair results.
- CSV and JSON downloads of visible entries.
- Markdown table copy and browser print output.
- Quiz question/result/statistics UI.
- Optional contextual Amazon search links plus the required Associates disclosure.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **Network/API failure:** Implemented response checks, rejection handling, timeout/abort logic, or catch paths expose the unavailable/error state; remote failure is not replaced with fabricated remote data.
- **Copy/download failure:** No additional clipboard failure policy is implemented beyond the browser operation. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/old-kanji-reference/app-meaning-v3.js`, `tools/old-kanji-reference/app-meaning-v4.js`, `tools/old-kanji-reference/app-meaning.js`, `tools/old-kanji-reference/app.js`, `tools/old-kanji-reference/howto/en/index.html`, `tools/old-kanji-reference/howto/index.html`, `tools/old-kanji-reference/index.html`.

## 7. Privacy/data handling

Search, detector, quiz, favorites, and export processing occur in the browser after same-site reference data loads. Detector/search input is not sent to an external kanji lookup service. Google Fonts, ads, analytics, and other page resources may load independently.

Amazon affiliate URLs are fixed-resource searches. Search text, detector text, selected kanji, favorites, recent state, quiz state, detail metadata, exports, and other user-derived values are not appended to those URLs or affiliate analytics. Affiliate click events use only the shared coarse keys `tool`, `affiliate`, `target`, and `placement`.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed include `ofuse.me`, `ko-fi.com`, and Amazon.co.jp through explicit user-initiated affiliate navigation.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The dense searchable catalog, filters, detector, display modes, export controls, details, favorites/recent state, and quiz are best served by desktop width while remaining responsive.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Shape/stroke detail grids and Amazon resource links collapse to one column on narrow screens.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The implemented `bilingual single-page` mode above is the canonical language behavior; repository HTML/JavaScript establishes the switching mechanism.
- Existing languages must not be removed.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/old-kanji-reference/`, and valid `WebApplication` JSON-LD. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button.

### Affiliate contract

- Shared `/assets/amazon-affiliate.js`, local `affiliate-config.js`, and local `affiliate.js` form the Amazon path.
- Production tracking ID is `nicheworks09-22`.
- Active targets are fixed searches for dictionaries, magnifiers, and book stands only.
- Associates disclosure is visible whenever active targets are available.
- Links use `rel="sponsored noopener"` and open externally through the shared helper.
- No product images, prices, ratings, reviews, availability, or scraped product metadata are rendered.
- No searched character, detector text, local state, or export data may enter affiliate URLs or affiliate analytics.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `recommended-and-missing`.
- **FAQ:** `recommended-and-present`.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Search modes and filters operate on loaded reference data without inventing missing metadata.
- [ ] Detector text highlights registered old forms and supports copy/send-to-converter actions locally.
- [ ] Favorites, recent entries, display mode, and quiz statistics restore from their documented localStorage keys.
- [ ] CSV/JSON/Markdown/print actions remain functional without requiring Pro entitlement.
- [ ] Public JP/EN copy explicitly identifies the current export actions as Free and does not label them Pro-only.
- [ ] The disabled Pro panel communicates billing unavailable and does not present planned learning/saved-set features as currently purchasable.
- [ ] Reference results retain cautions appropriate to non-authoritative old/variant-kanji data.
- [ ] Shape/stroke detail sections retain explicit grid/card/wrapping/mobile rules.
- [ ] Amazon resource configuration uses `nicheworks09-22` and only the three approved fixed queries.
- [ ] User-derived data never enters Amazon URLs or affiliate analytics.
- [ ] Associates disclosure and shared sponsored-link behavior remain active.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs` plus the existing old-kanji data validators. Behavior-level status remains **behavior-test-missing** for a full real-browser suite.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/app-meaning-v4.js`
- `tools/old-kanji-reference/style.css`
- `tools/old-kanji-reference/verified-badge.css`
- `tools/old-kanji-reference/amazon-layout.css`
- `tools/old-kanji-reference/affiliate-config.js`
- `tools/old-kanji-reference/affiliate.js`
- `assets/amazon-affiliate.js`
