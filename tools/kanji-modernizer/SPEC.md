# Tool Specification — Kanji Modernizer

- Slug: `kanji-modernizer`
- Public URL: `https://nicheworks.app/tools/kanji-modernizer/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Convert registered old-form and modern-form kanji character-by-character using the tool's dictionary while exposing replacements and ambiguity instead of claiming context-aware official-name conversion.

## Search cluster role

- Primary intent: convert pasted text between registered old and modern forms.
- Primary query families: `旧字体 変換`, `旧字体 変換サイト`, `旧字 新字 変換`.
- Supporting query families: `新字体 旧字体 変換`, `文章 旧字体 変換`.
- The page is the cluster's whole-text converter. It must not present itself as the generic old-kanji lookup/list page.
- Primary task handoffs are Old Kanji Reference, Old Document Kanji Highlighter, and Unicode Kanji Checker.

## Current functional contract

- Accept arbitrary text and convert Old → Modern or Modern → Old using the loaded dictionary.
- Preserve untouched text exactly, including leading/trailing whitespace, line breaks, and supplementary-plane characters; only registered mapped characters are transformed.
- For Modern → Old, support Conservative behavior that preserves characters with multiple candidates and First-candidate behavior that automatically selects the first dictionary candidate.
- Optionally exclude ASCII text, URLs, and code-block content from conversion.
- Highlight detected source hits, show converted text, list replacements/counts, and surface ambiguous Modern → Old candidates and resulting actions.
- Copy converted text and copy the replacement list.
- Display dictionary-size information and provide retry/error behavior if dictionary loading fails.
- Accept Reference handoff text through `?q=` and auto-convert only after dictionary loading has completed successfully. Reset clears the handoff query state.
- Provide JP/EN UI while remaining a Japanese-kanji transformation tool.

## Inputs

- Text to convert.
- Old→Modern or Modern→Old direction.
- Modern→Old ambiguity policy.
- ASCII/URL/code-block exclusion toggle.
- JP/EN UI selection.
- Optional same-site `?q=` handoff text from Old Kanji Reference.

## Outputs

- Converted text.
- Highlighted original text.
- Replacement table and counts.
- Ambiguity-review table for Modern → Old where relevant.
- Clipboard copies of converted text/replacement list.

## State and persistence

Input and conversion result are current-page state. The selected Modern → Old policy may be retained in browser-local storage. Dictionary data is loaded for the session; the current contract does not include persistent conversion history.

## Privacy and network behavior

Conversion runs in the browser and the input text is not intentionally uploaded by the conversion workflow. The dictionary is a site-hosted tool resource. Advertising/analytics resources may load separately.

## Language mode

`bilingual single-page`

JP/EN controls switch the same converter and explanation while the transformed content remains kanji-focused.

## Layout class

`hybrid`

Large input/result blocks and replacement tables benefit from width but can be stacked for mobile use.

## Limits and non-goals

- Conversion is dictionary-based and character-level, not contextual linguistic analysis.
- The tool does not guarantee correct official spellings for personal names, place names, legal names, historical text, or other proper nouns.
- Modern → Old can be inherently ambiguous; Conservative mode intentionally leaves ambiguous characters unchanged.

## Acceptance criteria

- [x] Registered Old → Modern characters are replaced according to the current dictionary and listed in the replacement summary. Evidence: `tests/behavior.test.mjs` exercises replacements/counts and supplementary-plane preservation.
- [x] Modern → Old ambiguity follows the selected Conservative or First-candidate policy and is exposed in the ambiguity review. Evidence: `tests/behavior.test.mjs` verifies preserved/selected actions, candidates, counts, and result characters.
- [x] The exclusion option protects implemented ASCII/URL/code-block regions from conversion. Evidence: `tests/behavior.test.mjs` verifies URL and fenced-code preservation while surrounding registered kanji still convert.
- [x] JP/EN switching preserves the same dictionary behavior and non-authoritative-name disclaimer. Evidence: `tests/behavior.test.mjs` compares conversion output in both language states and checks both disclaimer strings.
- [x] Leading/trailing whitespace and line breaks are preserved rather than trimmed from conversion/copy output. Evidence: `tests/behavior.test.mjs` verifies exact input preparation and exact clipboard payloads.
- [x] A `?q=` handoff waits for successful dictionary readiness before auto-conversion, dictionary load failure remains retryable, and Reset clears the handoff URL state. Evidence: `tests/behavior.test.mjs` plus the runtime source contract assertions.
- [x] The parsed Modernizer dictionary remains equivalent to the parsed Old Kanji Reference dictionary. Evidence: `tests/behavior.test.mjs` deep-compares both bundled `dict.json` files.

## Implementation evidence

- `tools/kanji-modernizer/index.html`
- `tools/kanji-modernizer/app.js`
- `tools/kanji-modernizer/dict.json`
- `tools/kanji-modernizer/tests/behavior.test.mjs`
- `tools/kanji-modernizer/data/`
- `tools/kanji-modernizer/usage.html`
- `tools/kanji-modernizer/usage-en.html`
