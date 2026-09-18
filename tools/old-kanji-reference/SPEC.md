# Tool Specification — Old Kanji Reference

- Slug: `old-kanji-reference`
- Public URL: `https://nicheworks.app/tools/old-kanji-reference/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules: `common-spec/amazon-affiliate.md`
- Search-cluster contract: `tools/OLD_KANJI_CLUSTER.md`

## Purpose

Provide a searchable bilingual reference for old Japanese kanji forms and their modern equivalents, including selected metadata, text detection, local study state, export utilities, and evidence-gated individual guides.

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
- Detect registered old forms inside pasted text, highlight them, copy detected old forms/pairs, and send the full text to Kanji Modernizer through a query parameter without trimming boundary whitespace or line breaks.
- Maintain browser-local favorites, recent entries, display mode, and quiz statistics.
- Provide quiz modes for old→modern, modern→old, and reading→old using suitable verified data.
- Export the currently visible entries as CSV or JSON, copy a Markdown table, and invoke browser print.
- Exported `dataStatus` reflects the entry's verified flag rather than merely the presence of reading/meaning metadata.
- CSV, JSON, Markdown, and print export controls are currently Free and are not gated on Pro entitlement.
- No unfinished public Pro sales panel is rendered. Current CSV/JSON/Markdown/print exports remain Free; future paid scope stays outside the public functional contract until verified billing activation.
- Detail rendering may add shape and stroke-reference sections. Those sections use explicit card/grid layout, wrapping, labels, and a single-column mobile fallback instead of browser-default unstyled blocks.
- Expose the evidence-gated individual guides currently approved by the cluster allowlist without treating the repository-side SEO candidate count as publishable inventory.
- Provide a dedicated `旧字体の調べ方` guide that routes search, image/OCR, and whole-text conversion needs to the appropriate current tool.
- Provide visible task handoffs for whole-text conversion, image OCR, Unicode inspection, variant comparison, and current name/family-register intent where relevant, without turning the page into a generic link directory.
- A primary `dict.json` load failure produces a stable visible error state with an explicit retry control. Optional enrichment-file failures do not block the primary mapping list.
- Historical Amazon resource wiring remains dormant compatibility code only. Canonical monetization class is `ADS_DONATION`; production affiliate config remains `enabled: false` with no tracking ID or outbound target.

## Amazon affiliate contract

- Canonical monetization SSOT class: `ADS_DONATION`.
- Old Kanji Reference is not in the canonical `AFFILIATE` class.
- Production `affiliate-config.js` must remain `enabled: false`, `provider: "disabled"`, with an empty `trackingId`, `targets`, and `searches`.
- Historical Amazon UI/helper files may remain only as dormant fail-closed compatibility wiring and must render no live Amazon CTA or Associates disclosure while disabled.
- No search/detector/detail/localStorage/export value may enter an affiliate URL or affiliate event.
- If a future explicit monetization decision moves this tool into the canonical `AFFILIATE` class, shared `/assets/amazon-affiliate.js` remains the only Amazon measurement authority and uses the coarse `affiliate_outbound` event. Cluster analytics must not duplicate that event.

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
- No live Amazon outbound handoff while the canonical affiliate config remains disabled.

## State and persistence

Browser-local keys include `oldKanjiReference.recent.v1`, `oldKanjiReference.displayMode.v1`, `oldKanjiReference.favorites.v1`, and `oldKanjiReference.quizStats.v1`. Search/filter text is current-session UI state. Reference data itself is loaded from bundled same-site assets. Historical Amazon compatibility configuration is static, disabled, and does not persist user state.

## Privacy and network behavior

Search, detector, quiz, favorites, and export processing occur in the browser after same-site reference data loads. Detector/search input is not sent to an external kanji lookup service. Google Fonts, ads, analytics, and other page resources may load independently. Current disabled Amazon compatibility wiring has no live outbound destination; user-derived reference/search state must not enter any future affiliate URL or event.

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
- Historical Amazon compatibility wiring is not authorization to activate affiliate links; activation requires an explicit canonical `AFFILIATE` classification.
- `identity` and `unresolved` records are not eligible for individual indexable pages. Repository-side `seoCandidate` status is not publication approval; current and future individual pages remain subject to the source + GSC-demand allowlist contract.

## Acceptance criteria

- [x] Search modes and filters operate on loaded reference data without inventing missing metadata. Evidence: `tests/behavior.test.mjs` exercises old/new/reading/meaning/Unicode lookup plus verified/pair-only filters.
- [x] SERP title/description identify this as a free old-kanji search/list reference and do not claim full-text conversion as the page's main function. Evidence: `scripts/check-old-kanji-reference-seo.mjs`.
- [x] The visible H1 is `旧字体検索・旧字体一覧` in Japanese mode. Evidence: `scripts/check-old-kanji-reference-seo.mjs`.
- [x] Canonical remains `https://nicheworks.app/tools/old-kanji-reference/` and WebApplication JSON-LD accurately describes current functionality. Evidence: `scripts/check-old-kanji-reference-seo.mjs`.
- [x] Visible FAQ content and FAQPage schema remain aligned. Evidence: `scripts/check-old-kanji-reference-seo.mjs`.
- [x] Task handoffs remain action-specific and respect the cluster role boundaries rather than becoming a generic SEO link dump. Evidence: `scripts/check-old-kanji-internal-handoffs.mjs` and `tests/behavior.test.mjs` for exact Reference → Modernizer payload preservation.
- [x] Detector text highlights registered old forms and supports copy/send-to-converter actions locally. Evidence: `tests/behavior.test.mjs` verifies detector hits/counts, large-input behavior, clipboard helper/bindings, and exact handoff text; runtime source renders detected characters with `<mark>`.
- [x] Favorites, recent entries, display mode, and quiz statistics restore from their documented localStorage keys. Evidence: `tests/behavior.test.mjs` verifies list round-trips, display-mode recovery/fallback, quiz-stat recovery/fallback/save; runtime initialization consumes the four documented keys.
- [ ] CSV/JSON/Markdown/print actions remain functional without requiring Pro entitlement. Wave 11 verifies row/status semantics, CSV escaping, clipboard behavior, and the four control bindings; final browser-interaction confirmation remains in Wave 15/19.
- [ ] Public JP/EN copy explicitly identifies the current export actions as Free and does not label them Pro-only.
- [ ] The public page does not expose a fixed Pro price, disabled purchase CTA, or billing-unavailable sales panel before verified billing activation.
- [ ] Reference results retain cautions appropriate to non-authoritative old/variant-kanji data.
- [ ] Shape/stroke detail sections have explicit responsive layout rules and do not render as unstyled raw blocks.
- [x] The individual-page inventory equals the reviewed allowlist; `identity`, `unresolved`, and demand-free candidates cannot be published automatically. Evidence: `scripts/check-old-kanji-reference-seo.mjs` plus the Wave 10 dictionary audit gate.
- [x] Canonical monetization keeps Old Kanji Reference outside the `AFFILIATE` class and production Amazon config fail-closed. Evidence: `MONETIZATION_CLASSIFICATION.json`, `affiliate-config.js`, and `scripts/check-old-kanji-amazon.mjs`.
- [x] No search/detector/detail/localStorage/export value can enter an Old Kanji Amazon URL/event while the config is disabled; cluster analytics also does not duplicate shared affiliate measurement. Evidence: `scripts/check-old-kanji-amazon.mjs` and `scripts/check-old-kanji-measurement.mjs`.
- [x] No Associates disclosure or live Amazon CTA is rendered from the disabled config. Evidence: shared Amazon helper renders disclosure/CTA only for active targets; `scripts/check-old-kanji-amazon.mjs` locks the disabled state.

## Implementation evidence

- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/howto/`
- `tools/old-kanji-reference/kanji/ga-kaku/`
- `tools/old-kanji-reference/kanji/sho-shou/`
- `tools/old-kanji-reference/kanji/kyu-old/`
- `tools/old-kanji-reference/app-meaning-v4.js`
- `tools/old-kanji-reference/tests/behavior.test.mjs`
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
