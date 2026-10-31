# Tool Specification — Place Old Kanji Checker

- Slug: `place-old-kanji-checker`
- Public URL: `https://nicheworks.app/tools/place-old-kanji-checker/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Check place names, addresses, station names, old-map labels, and sign text for registered old/variant kanji candidates as a reference aid.

## Search cluster role

- Primary intent: check place/address/station text for old/variant candidates.
- Primary query families: `地名 旧字体`, `住所 旧字体`, `駅名 旧字体`.
- Supporting query families: `古地図 旧字体`, `地名 異体字`.
- The page is the cluster's place/address-focused candidate checker and keeps an explicit official-use caution.
- Primary task handoffs are Old Kanji Reference, Kanji Modernizer, and Name Old Kanji Checker.

## Current functional contract

- Accept free-text place/address input.
- Check entered characters against local Old Kanji reference data in the browser.
- Surface candidate old/variant forms, modern forms, bilingual metadata, shape/stroke summaries, and caution information where available.
- Provide a follow-up link into Kanji Modernizer for whole-text conversion review.
- Link to Old Kanji Reference and Name Old Kanji Checker for related lookup.
- Switch JP/EN UI on the same page.
- Process entered text locally without an external place-name lookup API.
- Optional metadata/shape/stroke/compatibility asset failures degrade to the base mapping instead of blocking place-name checks.
- Do not render an unfinished Pro sales panel, fixed Pro price, or disabled purchase CTA while no verified purchase path is connected.

## Amazon affiliate contract

- Canonical monetization class: `AFFILIATE`.
- Amazon Associates is active for Place Old Kanji Checker under the all-eight Old Kanji affiliate decision.
- The affiliate panel appears only after a place-name result exists.
- Curated purchase intent: `角川日本地名大辞典`, `日本歴史地名大系`, and old-map/historical place-name references.
- Amazon destinations are fixed tool-specific searches; entered place names, addresses, station names, result candidates, and converter-handoff text must never be inserted into an affiliate URL or affiliate event.
- Shared `/assets/amazon-affiliate.js` owns URL validation, disclosure, `rel="sponsored noopener"`, and the canonical `affiliate_outbound` event.
- Shared `/assets/old-kanji-amazon-context.js` owns the reviewed tool-specific offer/placement catalog; it does not derive Amazon search terms from user input.
- The free tool task remains usable without interacting with Amazon.

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

- [x] Entered place/address text is checked against local reference data without external lookup submission.
- [x] Old forms resolve to modern mappings and modern forms expose registered reverse candidates, including array-valued mappings.
- [x] Failure of optional metadata/shape/stroke/compatibility assets still allows base mapping checks.
- [x] Available bilingual metadata, shape/stroke data, and rendering notes use the current Old Kanji Reference schemas.
- [x] Candidate results retain official-use cautions rather than presenting mappings as authoritative address data.
- [x] Whole-text Modernizer handoff preserves the entered text without trimming or silent mutation.
- [x] The public page does not expose unfinished billing/Pro sales controls until a verified entitlement/purchase path exists.

- [x] Contextual Amazon affiliate handoffs follow the reviewed only after a place-name result exists contract, use fixed tool-specific destinations, and exclude user-derived values from outbound URLs/events. Evidence: `assets/old-kanji-amazon-context.js`, `assets/amazon-affiliate.js`, and `scripts/check-old-kanji-amazon.mjs`.

## Implementation evidence

- `assets/amazon-affiliate.js`
- `assets/old-kanji-amazon-context.js`

- `tools/place-old-kanji-checker/index.html`
- `tools/place-old-kanji-checker/app.js`
- `tools/place-old-kanji-checker/tests/behavior.test.mjs` — forward/reverse/array mapping, bilingual metadata/shape/stroke/rendering-note schemas, optional-data degradation, safe primary-load failure, exact Modernizer handoff, privacy/non-authority wording, and public Pro-boundary regression QA.
- `tools/place-old-kanji-checker/style.css`
- `tools/old-kanji-reference/dict.json`

## Toolkit Pro Phase 1 — staged / not on sale

- Shared product ID: `okj.toolkit_pro` (one entitlement covers all eight tools).
- Current Free guarantee: Single place/rail/address candidate checks, metadata and Modernizer handoff remain Free.
- Proposed Pro feature IDs: `okj.place.batch`, `okj.history`, `okj.workspaces`, `okj.reports`, `okj.advancedExport`.
- The active Free workflow remains unchanged. No purchase CTA/fixed Pro price is allowed until verified checkout, entitlement, restore and browser QA.
- Canonical definition: `config/old-kanji-toolkit-pro-phase1.json`. Existing contextual Amazon Associates links remain active and independent of Pro; user content must not flow to affiliate URLs or analytics.

## Phase 1C — implemented batch checker (still not for sale)

- The existing Free single-entry input, all Free analysis/copy paths and Amazon context remain unchanged.
- Verified `okj.toolkit_pro` entitlement and the exact feature ID are required: `okj.place.batch`.
- Browser-only bulk entry (one per line) and local CSV import (one-column or named column), maximum 200 nonempty entries, maximum 400 characters per entry.
- Forward old→modern and reverse modern→old candidates use the same Old Kanji Reference `dict.json` mapping as the Free checker, including array-valued mappings. Results include unmatched entries; no claim of legal/official eligibility.
- Download CSV/JSON results locally. CSV output escapes cell quoting and mitigates spreadsheet formula interpretation. User input, files, addresses, names and results are not sent to billing, analytics or Amazon.
- Gate is re-verified before processing and exporting, and the panel is absent for unverified Free sessions. Browser QA uses mocked entitlement and does not verify real Stripe purchases.
