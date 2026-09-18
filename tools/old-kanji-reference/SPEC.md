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
- Amazon Associates is active through the reviewed contextual affiliate runtime; offers are tool-specific and user-derived content is never used to build Amazon destinations.

## Amazon affiliate contract

- Canonical monetization class: `AFFILIATE`.
- Amazon Associates is active for Old Kanji Reference under the all-eight Old Kanji affiliate decision.
- The affiliate panel appears after the main reference/list task.
- Curated purchase intent: `異体字の世界 最新版`, `くずし字用例辞典`, and `日本語の正しい表記と用語の辞典 第三版`.
- Amazon destinations are fixed tool-specific searches; searched kanji, detector text, detail state, favorites/recent state, quiz state, and export content must never be inserted into an affiliate URL or affiliate event.
- Shared `/assets/amazon-affiliate.js` owns URL validation, disclosure, `rel="sponsored noopener"`, and the canonical `affiliate_outbound` event.
- Shared `/assets/old-kanji-amazon-context.js` owns the reviewed tool-specific offer/placement catalog; it does not derive Amazon search terms from user input.
- The free tool task remains usable without interacting with Amazon.

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
- Active Amazon handoffs use only reviewed fixed destinations and the shared privacy-safe outbound event.

## State and persistence

Browser-local keys include `oldKanjiReference.recent.v1`, `oldKanjiReference.displayMode.v1`, `oldKanjiReference.favorites.v1`, and `oldKanjiReference.quizStats.v1`. Search/filter text is current-session UI state. Reference data itself is loaded from bundled same-site assets. Amazon affiliate configuration is fixed by tool and does not persist user input or result state.

## Privacy and network behavior

Search, detector, quiz, favorites, and export processing occur in the browser after same-site reference data loads. Detector/search input is not sent to an external kanji lookup service. Google Fonts, ads, analytics, and other page resources may load independently. Active Amazon handoffs use fixed curated destinations; user-derived values are excluded from URLs and affiliate analytics.

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
- Amazon is active under the explicit all-eight affiliate contract; future offer changes must preserve relevance, disclosure, and privacy boundaries.
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
- [x] CSV/JSON/Markdown/print actions remain functional without requiring Pro entitlement. Evidence: `tests/behavior.test.mjs` verifies row/status semantics, CSV escaping and bindings; Wave 19 extends `scripts/check-old-kanji-browser-ux.mjs` to click all four controls in real Chrome and verify CSV/JSON downloads, Markdown clipboard output, and print invocation.
- [x] Public JP/EN copy explicitly identifies the current export actions as Free and does not label them Pro-only. Evidence: `scripts/check-old-kanji-pro-boundary.mjs` and the Wave 19 browser export check require the JP/EN Free copy.
- [x] The public page does not expose a fixed Pro price, disabled purchase CTA, or billing-unavailable sales panel before verified billing activation. Evidence: `scripts/check-old-kanji-pro-boundary.mjs` checks all eight public Old Kanji landing pages.
- [x] Reference results retain cautions appropriate to non-authoritative old/variant-kanji data. Evidence: the public name/official-spelling caution, source-backed FAQ boundaries, runtime compatibility/rendering notes, and `scripts/check-old-kanji-release-audit.mjs`.
- [x] Shape/stroke detail sections have explicit responsive layout rules and do not render as unstyled raw blocks. Evidence: Wave 19 adds dedicated `.shape-note*` / `.stroke-note*` desktop and mobile rules in `style.css`, guarded by `scripts/check-old-kanji-reference-layout.mjs`.
- [x] The individual-page inventory equals the reviewed allowlist; `identity`, `unresolved`, and demand-free candidates cannot be published automatically. Evidence: `scripts/check-old-kanji-reference-seo.mjs` plus the Wave 10 dictionary audit gate.

- [x] Contextual Amazon affiliate handoffs follow the reviewed after the main reference/list task contract, use fixed tool-specific destinations, and exclude user-derived values from outbound URLs/events. Evidence: `assets/old-kanji-amazon-context.js`, `assets/amazon-affiliate.js`, and `scripts/check-old-kanji-amazon.mjs`.

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
- `assets/amazon-affiliate.js`
- `assets/old-kanji-amazon-context.js`
