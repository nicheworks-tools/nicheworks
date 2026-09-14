# Tool Specification — Old Kanji Reference

- Slug: `old-kanji-reference`
- Public URL: `https://nicheworks.app/tools/old-kanji-reference/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules: `common-spec/amazon-affiliate.md`

## Purpose

Provide a searchable bilingual reference for old Japanese kanji forms and their modern equivalents, including selected metadata, text detection, local study state, export utilities, and optional contextual Amazon search handoffs for physical reference tools.

## Current functional contract

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
- Detail rendering may add shape and stroke-reference sections. Those sections use explicit card/grid layout, wrapping, labels, and a single-column mobile fallback instead of browser-default unstyled blocks.
- A separate optional Amazon resource panel exposes fixed searches for old/variant-kanji dictionaries, document magnifiers, and book stands.

## Amazon affiliate contract

- Tracking ID: `nicheworks09-22`.
- Search base: `https://www.amazon.co.jp/s`.
- Fixed search terms only: `旧字体 異体字 辞典`, `古文書 ルーペ`, `書見台 ブックスタンド`.
- Search URLs are generated locally as Amazon.co.jp search URLs with the tracking tag.
- Search/detector input, selected kanji, favorites, recent state, quiz state, detail metadata, exports, and any other user-derived value are never appended to affiliate URLs.
- Shared `/assets/amazon-affiliate.js` supplies URL validation, Associates disclosure, `rel="sponsored noopener"`, and coarse `affiliate_click` metadata only.
- Allowed click metadata remains only `tool`, `affiliate`, `target`, and `placement`.
- No Amazon product image, price, rating, review, availability, or scraped product metadata is displayed.

## Inputs

- Search query and search-mode selection.
- Category/status/display filters.
- Pasted detector text.
- Favorite/recent/detail interactions.
- Quiz mode, preset, and answers.
- JP/EN display language.

## Outputs

- Filtered old/modern kanji reference cards/table.
- Reading, meaning, usage, category, Unicode, rendering/compatibility detail when present.
- Shape/stroke detail cards when corresponding bundled metadata exists.
- Text-detection highlight and pair results.
- CSV and JSON downloads of visible entries.
- Markdown table copy and browser print output.
- Quiz question/result/statistics UI.
- Optional fixed Amazon search handoffs for dictionaries, magnifiers, and book stands, plus Associates disclosure.

## State and persistence

Browser-local keys include `oldKanjiReference.recent.v1`, `oldKanjiReference.displayMode.v1`, `oldKanjiReference.favorites.v1`, and `oldKanjiReference.quizStats.v1`. Search/filter text is current-session UI state. Reference data itself is loaded from bundled same-site assets. Amazon resource configuration is static and does not persist user state.

## Privacy and network behavior

Search, detector, quiz, favorites, and export processing occur in the browser after same-site reference data loads. Detector/search input is not sent to an external kanji lookup service. Google Fonts, ads, analytics, and other page resources may load independently. Amazon links are fixed search handoffs and do not contain searched characters, detector text, or local state.

## Language mode

`bilingual single-page`

## Layout class

`pc-oriented`

The dense searchable catalog, filters, detector, display modes, export controls, details, favorites/recent state, and quiz are best served by desktop width while remaining responsive. Shape/stroke detail grids and Amazon resource links collapse to one column on narrow screens.

## Limits and non-goals

- Old↔modern mappings are reference aids and are not guaranteed to be one-to-one.
- Metadata coverage is intentionally incomplete; lack of reading/meaning does not invalidate a mapping.
- The tool is not an official family-register/name authority, historical-linguistics authority, or document transcription service.
- Full-text conversion belongs to Kanji Modernizer rather than this reference catalog.
- Rendering can vary for compatibility ideographs, supplementary-plane characters, and variation selectors.
- Old Kanji Toolkit billing is currently unavailable on this page; planned Pro areas are not part of the currently purchasable functional contract.
- Amazon search links are optional shopping handoffs, not product endorsements or suitability guarantees.

## Acceptance criteria

- [ ] Search modes and filters operate on loaded reference data without inventing missing metadata.
- [ ] Detector text highlights registered old forms and supports copy/send-to-converter actions locally.
- [ ] Favorites, recent entries, display mode, and quiz statistics restore from their documented localStorage keys.
- [ ] CSV/JSON/Markdown/print actions remain functional without requiring Pro entitlement.
- [ ] Public JP/EN copy explicitly identifies the current export actions as Free and does not label them Pro-only.
- [ ] The disabled Pro panel communicates billing unavailable and does not present planned learning/saved-set features as currently purchasable.
- [ ] Reference results retain cautions appropriate to non-authoritative old/variant-kanji data.
- [ ] Shape/stroke detail sections have explicit responsive layout rules and do not render as unstyled raw blocks.
- [ ] Amazon resource links use only the three fixed search terms and `nicheworks09-22`.
- [ ] No search/detector/detail/localStorage/export value enters Amazon URLs or affiliate analytics.
- [ ] Associates disclosure is rendered whenever the active Amazon targets are available.

## Implementation evidence

- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/app-meaning-v4.js`
- `tools/old-kanji-reference/verified-badge.js`
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/meta.json`
- `tools/old-kanji-reference/compatibility-notes.json`
- `tools/old-kanji-reference/style.css`
- `tools/old-kanji-reference/amazon-layout.css`
- `tools/old-kanji-reference/affiliate-config.js`
- `tools/old-kanji-reference/affiliate.js`
- `assets/amazon-affiliate.js`
