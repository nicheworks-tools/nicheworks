# Tool Specification — Old Kanji Reference

- Slug: `old-kanji-reference`
- Public URL: `https://nicheworks.app/tools/old-kanji-reference/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a searchable bilingual reference for old Japanese kanji forms and their modern equivalents, including selected metadata, text detection, local study state, and export utilities.

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
- The current implementation wires these export controls directly and does not gate them on Pro entitlement.
- A visible Old Kanji Toolkit Pro panel describes export/report and other advanced features while billing is unavailable. That panel conflicts with the current ungated export implementation; runtime Free export behavior is authoritative for this specification.

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
- Text-detection highlight and pair results.
- CSV and JSON downloads of visible entries.
- Markdown table copy and browser print output.
- Quiz question/result/statistics UI.

## State and persistence

Browser-local keys include `oldKanjiReference.recent.v1`, `oldKanjiReference.displayMode.v1`, `oldKanjiReference.favorites.v1`, and `oldKanjiReference.quizStats.v1`. Search/filter text is current-session UI state. Reference data itself is loaded from bundled same-site assets.

## Privacy and network behavior

Search, detector, quiz, favorites, and export processing occur in the browser after same-site reference data loads. Detector/search input is not sent to an external kanji lookup service. Google Fonts, ads, analytics, and other page resources may load independently.

## Language mode

`bilingual single-page`

## Layout class

`pc-oriented`

The dense searchable catalog, filters, detector, display modes, export controls, details, favorites/recent state, and quiz are best served by desktop width while remaining responsive.

## Limits and non-goals

- Old↔modern mappings are reference aids and are not guaranteed to be one-to-one.
- Metadata coverage is intentionally incomplete; lack of reading/meaning does not invalidate a mapping.
- The tool is not an official family-register/name authority, historical-linguistics authority, or document transcription service.
- Full-text conversion belongs to Kanji Modernizer rather than this reference catalog.
- Rendering can vary for compatibility ideographs, supplementary-plane characters, and variation selectors.
- The current Pro copy that labels export/report as Pro is inconsistent with the active Free export handlers and must not be treated as the implemented entitlement contract.
- Old Kanji Toolkit billing is currently unavailable on this page.

## Acceptance criteria

- [ ] Search modes and filters operate on loaded reference data without inventing missing metadata.
- [ ] Detector text highlights registered old forms and supports copy/send-to-converter actions locally.
- [ ] Favorites, recent entries, display mode, and quiz statistics restore from their documented localStorage keys.
- [ ] CSV/JSON/Markdown/print actions remain functional under the current implementation without requiring Pro entitlement.
- [ ] Public documentation must not describe currently ungated exports as runtime-Pro-only behavior unless the implementation is changed to enforce that gate.
- [ ] Reference results retain cautions appropriate to non-authoritative old/variant-kanji data.

## Implementation evidence

- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/app-meaning-v4.js`
- `tools/old-kanji-reference/verified-badge.js`
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/meta.json`
- `tools/old-kanji-reference/compatibility-notes.json`
- `tools/old-kanji-reference/style.css`
