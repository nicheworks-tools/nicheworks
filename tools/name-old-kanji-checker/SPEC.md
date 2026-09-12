# Tool Specification — Name Old Kanji Checker

- Slug: `name-old-kanji-checker`
- Public URL: `https://nicheworks.app/tools/name-old-kanji-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Check characters in a name against the Old Kanji Reference data and surface old-form, modern-form, and variant candidates as a reference aid.

## Current functional contract

- Accept arbitrary name text and inspect it character by character.
- Load same-site Old Kanji Reference mapping data, metadata files, and compatibility notes.
- Detect an entered old form and show its mapped modern form when present.
- Build a reverse lookup so entered modern forms can show registered old/variant candidates.
- Show available reading, meaning, category, and rendering/compatibility notes from the reference data.
- Provide copy actions for input characters, modern forms, candidates, and candidate lists.
- Link to the full Old Kanji Reference and Kanji Modernizer for follow-up review.
- Degrade to basic mappings when optional metadata files fail to load.
- Show Old Kanji Toolkit Pro as billing-unavailable/locked; batch, reports, exports, saved sets, and audit-note capabilities are not currently purchasable through this page.

## Inputs

- Name text.
- JP/EN display selection.

## Outputs

- Per-character old→modern or modern→old/variant candidate cards.
- Reading/meaning/category metadata when available.
- Compatibility/rendering cautions.
- Copyable candidate data and related-tool links.

## State and persistence

Input and results are current-page state. The tool loads reference data from same-site JSON assets and does not maintain a saved name history. Pro is currently presented in a billing-unavailable state rather than as an active purchase flow.

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
- Pro functions shown in the current page are locked because billing is not connected.

## Acceptance criteria

- [ ] Old forms in the reference mapping show their modern mapping and modern forms show registered reverse candidates when available.
- [ ] Failure of optional metadata files still allows base mapping checks rather than falsely reporting a total application failure.
- [ ] Entered name text is not sent to an external character-lookup API.
- [ ] Results retain explicit official-use cautions and do not claim legal/registry authority.
- [ ] Billing-unavailable Pro controls remain disabled until a real entitlement/purchase path exists.

## Implementation evidence

- `tools/name-old-kanji-checker/index.html`
- `tools/name-old-kanji-checker/app.js`
- `tools/name-old-kanji-checker/style.css`
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/compatibility-notes.json`
