# Tool Specification — Moving Checklist Generator

- Slug: `moving-checklist-generator`
- Public URL: `https://nicheworks.app/tools/moving-checklist-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a chronological moving checklist from 30 days before the move through post-move follow-up, based on a move date and household/home conditions, with browser-local completion tracking and print/PDF support.

### Search and product scope boundary

This tool is the broad moving-timeline surface. Its primary intent is planning and tracking the whole move across preparation, address/government procedures, utilities, packing, moving day, and post-move follow-up.

`moving-lease-final-check` is the separate final-stage surface for move-out / pre-vacate checking such as inspection, photo evidence, meter photos, key return, cancellation confirmation, and handoff notes. The two tools may reference overlapping moving-day tasks, but their primary search intent and product role MUST remain distinct.

## Affiliate boundary

The canonical monetization class is `AFFILIATE`. The live commerce block uses the validated NicheWorks Amazon Japan tagged-search template with tracking ID `nicheworks09-22` and fixed general moving/packing-supply queries only. Move date, household/home type, memo text, checklist state, and completion progress never enter an Amazon URL.

Contextually acceptable future product areas are ordinary moving/packing supplies such as boxes, packing tape, labels/markers, and protective packing materials. Affiliate placements should live near preparation/packing context and remain separate from government, address-change, contract, utility, or legal-adjacent checklist items.

Checklist state MUST NOT be used to infer that a user must buy a product. The tool MUST NOT imply that purchasing an item completes an official procedure, satisfies a landlord/municipal requirement, or guarantees a successful move. If no verified affiliate configuration exists, the correct commerce state is no affiliate offer.

## Current functional contract

- Accept move date, household type (`solo` or `family`), and home type (`rental` or `owned`).
- Accept an optional print-only memo up to 40 characters.
- Generate reference tasks spanning preparation before the move through post-move follow-up.
- Keep a crawlable static overview of the move timeline from 30 days before through post-move follow-up so the page's core planning intent is available before checklist generation.
- Track completion state and show progress for the current condition set.
- Save checkbox state keyed by the identifying conditions: move date, household type, and home type.
- Do not persist the optional print memo.
- Allow clearing checks, resetting form inputs, deleting the current condition's saved data, and deleting all saved checklist data.
- Use browser print for paper output or user-selected PDF save.
- Switch JP/EN UI.

## Inputs

- Move date.
- Household: solo or family.
- Home type: rental or owned.
- Optional 40-character print memo.
- Checklist completion toggles.

## Outputs

- Chronological checklist.
- Progress/completion summary.
- Print-friendly checklist including the optional memo when provided.
- Browser print/PDF flow.

## State and persistence

Checklist state and condition identifiers are stored in localStorage. The print memo is intentionally not persisted. Saved states do not sync across browsers or devices and are removed when site data is cleared or the user deletes them.

## Privacy and network behavior

Checklist generation and completion tracking are browser-side. The optional memo and moving conditions are not sent to a checklist backend. Ads/analytics can load independently.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The core interaction is a compact form followed by a chronological checklist; a dedicated print presentation is provided.

## Limits and non-goals

- The checklist is a general reference and is not guaranteed to cover every municipality, contract, utility, or personal situation.
- This tool is not the dedicated lease-exit evidence / inspection workflow; use `moving-lease-final-check` for that final-stage use case.
- PDF output is provided through the browser print dialog rather than a dedicated PDF generator.
- The print memo can appear in printed/PDF output even though it is not stored; users should avoid personal information.
- Official municipality, landlord/management, utility, and contract guidance takes precedence.

## Acceptance criteria

- [ ] A valid move date plus household/home type produces a condition-specific checklist and progress state.
- [ ] Checkbox state survives reload for the same condition set but does not leak to a different condition set.
- [ ] The optional print memo is not written to persistent storage.
- [ ] Delete-current and delete-all actions remove the corresponding saved checklist state.
- [ ] Print/PDF uses the browser print flow and does not claim server-generated PDF storage.
- [ ] Public metadata describes the broad 30-days-before-through-post-move timeline rather than presenting this as the dedicated lease-exit final check.
- [ ] The initial HTML exposes the major timeline stages (30 days, 14 days, 7 days, 3 days, day before, moving day, post-move) without requiring a generated checklist.
- [ ] The page links to `moving-lease-final-check` as the dedicated final-stage companion.
- [ ] The active Amazon block uses only fixed general moving/packing-supply queries and the shared `nicheworks09-22` tagged-search template.
- [ ] Affiliate content remains limited to general moving/packing supplies and never represents an official checklist requirement.

## Implementation evidence

- `tools/moving-checklist-generator/index.html`
- `tools/moving-checklist-generator/app.js`
- `tools/moving-checklist-generator/style.css`
- `tools/moving-checklist-generator/affiliate-config.js`
