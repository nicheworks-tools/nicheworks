# Tool Specification — Place Old Kanji Checker

- Slug: `place-old-kanji-checker`
- Public URL: `https://nicheworks.app/tools/place-old-kanji-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Check place names, addresses, station names, old-map labels, and sign text for registered old/variant kanji candidates as a reference aid.

## Current functional contract

- Accept free-text place/address input.
- Check entered characters against local Old Kanji reference data in the browser.
- Surface candidate old/variant forms, modern forms, summaries, and caution information where available.
- Provide a follow-up link into Kanji Modernizer for whole-text conversion review.
- Link to Old Kanji Reference and Name Old Kanji Checker for related lookup.
- Switch JP/EN UI on the same page.
- Process entered text locally without an external place-name lookup API.
- Do not render an unfinished Pro sales panel, fixed Pro price, or disabled purchase CTA while no verified purchase path is connected.

## Inputs

- Place name, address, station name, or related text.
- JP/EN display language.

## Outputs

- Result summary.
- Per-character/place-name old/variant candidate information.
- Caution panel for official-use limitations.
- Related-tool/converter links.

## State and persistence

Input and results are current-page state and are not persisted as place-name history. No paid entitlement or purchase UI is part of the current public page state.

## Privacy and network behavior

Place-name checking runs in the browser using same-site reference data. Entered text is not sent to an external place/kanji API. Ads and analytics may load separately.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The primary interaction is one text area followed by results and caution cards.

## Limits and non-goals

- The tool is not an official address, municipal place-name, registration, postal, cadastral, or contract authority.
- A candidate old/variant mapping does not prove historical or current official spelling.
- Official-use cases require checking the actual registered/current spelling with authoritative sources.
- No fixed Pro price or unfinished purchase controls are rendered on the public page while billing is inactive.

## Acceptance criteria

- [ ] Entered place/address text is checked against local reference data without external lookup submission.
- [ ] Candidate results retain official-use cautions rather than presenting mappings as authoritative address data.
- [ ] Related-tool links support deeper reference/conversion review without changing the entered text silently.
- [ ] The public page does not expose unfinished billing/Pro sales controls until a verified entitlement/purchase path exists.

## Implementation evidence

- `tools/place-old-kanji-checker/index.html`
- `tools/place-old-kanji-checker/app.js`
- `tools/place-old-kanji-checker/style.css`
- `tools/old-kanji-reference/dict.json`
