# Tool Specification — Old Kanji Reference

- Slug: `old-kanji-reference`
- Public URL: `https://nicheworks.app/tools/old-kanji-reference/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules: `common-spec/amazon-affiliate.md`
- Search-cluster contract: `tools/OLD_KANJI_CLUSTER.md`

## Purpose

Provide a searchable bilingual reference for old Japanese kanji forms and their modern equivalents, including selected metadata, text detection, local study state, export utilities, evidence-gated individual guides, and optional contextual Amazon search handoffs for physical reference tools.

## Search cluster role

- Primary intent: look up one old/new kanji pair, or browse/search the Old Kanji reference list.
- Primary query families: `旧字体 一覧`, `旧字体 検索`, `旧字 検索`, `<漢字> 旧字体`, `<漢字> 旧字`.
- Supporting query families: `旧字体 調べ方`, `昔の漢字 一覧`, and queries for reading/Unicode attached to a known entry.
- The page is the generic lookup/search entry point for the Old Kanji cluster. It must not present itself as the primary full-text conversion or OCR page.
- SERP-facing title/description should make the free searchable/list nature explicit and describe old/new-form comparison without claiming unsupported metadata coverage.
- Primary task handoffs are limited to Kanji Modernizer (full-text conversion), Old Kanji OCR Scanner (image input), Unicode Kanji Checker, and Variant Kanji Compare.
- Individual-kanji pages are **allowlist-only**. The current production allowlist is `kanji/ga-kaku/`, `kanji/sho-shou/`, and `kanji/kyu-old/`. Any future page requires both the dictionary/source gate and actual settled GSC demand defined by `tools/OLD_KANJI_CLUSTER.md`; `identity`, `unresolved`, bare-pair, or demand-free records must not be mass-generated into indexable pages.

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
- No unfinished public Pro sales panel is rendered. Current CSV/JSON/Markdown/print exports remain Free; future paid scope stays outside the public functional contract until verified billing activation.
- Detail rendering may add shape and stroke-reference sections. Those sections use explicit card/grid layout, wrapping, labels, and a single-column mobile fallback instead of browser-default unstyled blocks.
- Expose the evidence-gated individual guides currently approved by the cluster allowlist without treating the repository-side SEO candidate count as publishable inventory.
- Provide a dedicated `旧字体の調べ方` guide that routes search, image/OCR, and whole-text conversion needs to the appropriate current tool.
- Provide visible task handoffs for whole-text conversion, image OCR, Unicode inspection, variant comparison, and current name/family-register intent where relevant, without turning the page into a generic link directory.
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
- Links to the currently allowlisted individual guides where applicable.
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
- No fixed Pro price or unfinished purchase controls are rendered on the public page while billing is inactive.
- Amazon search links are optional shopping handoffs, not product endorsements or suitability guarantees.
- `identity` and `unresolved` records are not eligible for individual indexable pages. Repository-side `seoCandidate` status is not publication approval; current and future individual pages remain subject to the source + GSC-demand allowlist contract.

## Acceptance criteria

- [ ] Search modes and filters operate on loaded reference data without inventing missing metadata.
- [ ] SERP title/description identify this as a free old-kanji search/list reference and do not claim full-text conversion as the page's main function.
- [ ] The visible H1 is `旧字体検索・旧字体一覧` in Japanese mode.
- [ ] Canonical remains `https://nicheworks.app/tools/old-kanji-reference/` and WebApplication JSON-LD accurately describes current functionality.
- [ ] Visible FAQ content and FAQPage schema remain aligned.
- [ ] Task handoffs remain action-specific and respect the cluster role boundaries rather than becoming a generic SEO link dump.
- [ ] Detector text highlights registered old forms and supports copy/send-to-converter actions locally.
- [ ] Favorites, recent entries, display mode, and quiz statistics restore from their documented localStorage keys.
- [ ] CSV/JSON/Markdown/print actions remain functional without requiring Pro entitlement.
- [ ] Public JP/EN copy explicitly identifies the current export actions as Free and does not label them Pro-only.
- [ ] The public page does not expose a fixed Pro price, disabled purchase CTA, or billing-unavailable sales panel before verified billing activation.
- [ ] Reference results retain cautions appropriate to non-authoritative old/variant-kanji data.
- [ ] Shape/stroke detail sections have explicit responsive layout rules and do not render as unstyled raw blocks.
- [ ] The individual-page inventory equals the reviewed allowlist; `identity`, `unresolved`, and demand-free candidates cannot be published automatically.
- [ ] Amazon resource links use only the three fixed search terms and `nicheworks09-22`.
- [ ] No search/detector/detail/localStorage/export value enters Amazon URLs or affiliate analytics.
- [ ] Associates disclosure is rendered whenever the active Amazon targets are available.

## Implementation evidence

- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/howto/`
- `tools/old-kanji-reference/kanji/ga-kaku/`
- `tools/old-kanji-reference/kanji/sho-shou/`
- `tools/old-kanji-reference/kanji/kyu-old/`
- `tools/old-kanji-reference/app-meaning-v4.js`
- `tools/old-kanji-reference/verified-badge.js`
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/meta.json`
- `tools/old-kanji-reference/compatibility-notes.json`
- `tools/old-kanji-reference/dictionary-audit.json`
- `tools/old-kanji-reference/dictionary-repair-evidence.json`
- `tools/old-kanji-reference/style.css`
- `tools/old-kanji-reference/amazon-layout.css`
- `tools/old-kanji-reference/affiliate-config.js`
- `tools/old-kanji-reference/affiliate.js`
- `assets/amazon-affiliate.js`
