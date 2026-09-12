# Tool Specification — Kanji Modernizer

- Slug: `kanji-modernizer`
- Public URL: `https://nicheworks.app/tools/kanji-modernizer/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Convert registered old-form and modern-form kanji character-by-character using the tool's dictionary while exposing replacements and ambiguity instead of claiming context-aware official-name conversion.

## Current functional contract

- Accept arbitrary text and convert Old → Modern or Modern → Old using the loaded dictionary.
- For Modern → Old, support Conservative behavior that preserves characters with multiple candidates and First-candidate behavior that automatically selects the first dictionary candidate.
- Optionally exclude ASCII text, URLs, and code-block content from conversion.
- Highlight detected source hits, show converted text, list replacements/counts, and surface ambiguous Modern → Old candidates and resulting actions.
- Copy converted text and copy the replacement list.
- Display dictionary-size information and provide retry/error behavior if dictionary loading fails.
- Provide JP/EN UI while remaining a Japanese-kanji transformation tool.

## Inputs

- Text to convert.
- Old→Modern or Modern→Old direction.
- Modern→Old ambiguity policy.
- ASCII/URL/code-block exclusion toggle.
- JP/EN UI selection.

## Outputs

- Converted text.
- Highlighted original text.
- Replacement table and counts.
- Ambiguity-review table for Modern → Old where relevant.
- Clipboard copies of converted text/replacement list.

## State and persistence

Input and conversion result are current-page state. Dictionary data is loaded for the session; the current contract does not include persistent conversion history.

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

- [ ] Registered Old → Modern characters are replaced according to the current dictionary and listed in the replacement summary.
- [ ] Modern → Old ambiguity follows the selected Conservative or First-candidate policy and is exposed in the ambiguity review.
- [ ] The exclusion option protects implemented ASCII/URL/code-block regions from conversion.
- [ ] JP/EN switching preserves the same dictionary behavior and non-authoritative-name disclaimer.

## Implementation evidence

- `tools/kanji-modernizer/index.html`
- `tools/kanji-modernizer/app.js`
- `tools/kanji-modernizer/data/`
- `tools/kanji-modernizer/usage.html`
- `tools/kanji-modernizer/usage-en.html`
