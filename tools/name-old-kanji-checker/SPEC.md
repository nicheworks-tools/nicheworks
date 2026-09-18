# Tool Specification — Name Old Kanji Checker

- Slug: `name-old-kanji-checker`
- Public URL: `https://nicheworks.app/tools/name-old-kanji-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Check characters in a name against the Old Kanji Reference data and surface old-form, modern-form, and variant candidates as a reference aid.

## Search cluster role

- Primary intent: check personal-name text for old/variant candidates.
- Primary query families: `名前 旧字体`, `人名 旧字体`, `苗字 旧字体`.
- Supporting query families: `氏名 異体字`, `戸籍 旧字体`.
- The page is the cluster's name-focused candidate checker and keeps an explicit registry/legal caution.
- Primary task handoffs are Old Kanji Reference, Variant Kanji Compare, and Unicode Kanji Checker.

## Current functional contract

- Accept arbitrary name text and inspect it character by character.
- Load same-site Old Kanji Reference mapping data, metadata files, and compatibility notes.
- Detect an entered old form and show its mapped modern form when present.
- Build a reverse lookup so entered modern forms can show registered old/variant candidates.
- Show available reading, meaning, category, and rendering/compatibility notes from the reference data.
- Provide copy actions for input characters, modern forms, candidates, and candidate lists.
- Link to the full Old Kanji Reference and Kanji Modernizer for follow-up review; the whole-text Modernizer handoff preserves the exact entered text, including leading/trailing whitespace and line breaks.
- Degrade to basic mappings when optional metadata files fail to load.
- Do not render an unfinished Pro sales panel, fixed Pro price, or disabled purchase CTA while no verified purchase path is connected.

## Inputs

- Name text.
- JP/EN display selection.

## Outputs

- Per-character old→modern or modern→old/variant candidate cards.
- Reading/meaning/category metadata when available.
- Compatibility/rendering cautions.
- Copyable candidate data and related-tool links.

## State and persistence

Input and results are current-page state. The tool loads reference data from same-site JSON assets and does not maintain a saved name history. No paid entitlement or purchase UI is part of the current public page state; future Pro scope remains outside the public free workflow until verified billing activation.

## Privacy and network behavior

Name checking runs in the browser after same-site reference JSON is loaded. Entered names are not sent to an external lookup API. Advertising and analytics resources may load separately.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The workflow is a short name input followed by vertically stacked per-character result cards and warnings.

## Limits and non-goals

- Candidate mappings are reference data and do not establish legal validity, official spelling, or registration eligibility.
- Family registers, residence records, banking, insurance, school, workplace, and other official uses require verification of the actually registered glyph.
- Missing metadata does not imply a character is invalid; optional data can fail independently of the base mapping.
- Compatibility ideographs, supplementary-plane characters, and variation selectors can render differently by environment.
- No fixed Pro price or unfinished purchase controls are rendered on the public page while billing is inactive.

## Acceptance criteria

- [x] Old forms in the reference mapping show their modern mapping and modern forms show registered reverse candidates when available.
- [x] Failure of optional metadata files still allows base mapping checks rather than falsely reporting a total application failure.
- [x] Entered name text is not sent to an external character-lookup API.
- [x] Results retain explicit official-use cautions and do not claim legal/registry authority.
- [x] Whole-text Modernizer handoff preserves the entered text without trimming leading/trailing whitespace or line breaks.
- [x] The public page does not expose unfinished billing/Pro sales controls until a verified entitlement/purchase path exists.

## Implementation evidence

- `tools/name-old-kanji-checker/index.html`
- `tools/name-old-kanji-checker/app.js`
- `tools/name-old-kanji-checker/tests/behavior.test.mjs` — forward/reverse mapping, supplementary Unicode handling, optional-data degradation, exact Modernizer handoff, privacy/non-authority wording, and public Pro-boundary regression QA.
- `tools/name-old-kanji-checker/style.css`
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/compatibility-notes.json`
