# Tool Specification — JP Postal Lite

- Slug: `jp-postal-lite`
- Public URL: `https://nicheworks.app/tools/jp-postal-lite/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Search Japanese postal-code reference data by prefecture and partial address, collect selected matches, and export a small CSV for follow-up work while requiring official confirmation for important uses.

## Current functional contract

- Load the tool's own `./data/*.json` postal datasets for all supported prefectures; the current implementation does not automatically fall back to an external backup JSON service.
- Require a prefecture and at least two address characters, with light normalization for full-width digits/spaces and hyphen variants.
- Return up to 50 matching postal-code/address candidates and show data-load failures rather than treating empty/corrupt data as valid.
- Allow result rows to be copied or added to an output list.
- Allow output-list rows to be removed/cleared and download `postal_code,address` CSV.
- Display dataset coverage/check-date information without claiming that the NicheWorks check date is the official address-change effective date.

## Inputs

- Prefecture selection.
- Partial Japanese address query.
- Result-row actions and output-list management.

## Outputs

- Matching postal-code/address candidates.
- Selected output list.
- User-triggered CSV download.

## State and persistence

Search and output-list state are current-page browser state. The current contract does not include persistent address history or cloud synchronization.

## Privacy and network behavior

Search processing and output-list construction run in the browser using NicheWorks-hosted local JSON datasets. The address query is not intentionally submitted to an application search backend. Advertising and analytics resources may load separately.

## Language mode

`Japanese-only`

The tool is specifically for Japanese addresses/postal codes and the current UI is Japanese-only.

## Layout class

`mobile-oriented`

Prefecture/query controls, result cards, and output list are designed as a stacked lookup workflow usable on narrow screens.

## Limits and non-goals

- Results are reference assistance, not official Japan Post certification.
- Shipping, billing, contracts, KYC, and other important uses require confirmation against Japan Post or the recipient.
- Search results are capped at 50 visible candidates per query.
- Data freshness depends on the bundled NicheWorks JSON data and does not imply real-time official updates.

## Acceptance criteria

- [ ] Selecting a loaded prefecture and entering at least two address characters returns matching bundled-data candidates or a clear no-result/load-error state.
- [ ] Result rows can be added to and removed from the output list without modifying source postal data.
- [ ] CSV download contains the selected rows in `postal_code,address` form.
- [ ] The UI keeps the official-information disclaimer and does not claim external backup JSON retrieval.

## Implementation evidence

- `tools/jp-postal-lite/index.html`
- `tools/jp-postal-lite/app.js`
- `tools/jp-postal-lite/data/`
