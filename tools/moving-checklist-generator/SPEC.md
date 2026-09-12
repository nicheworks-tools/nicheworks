# Tool Specification — Moving Checklist Generator

- Slug: `moving-checklist-generator`
- Public URL: `https://nicheworks.app/tools/moving-checklist-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a chronological moving checklist from a move date and household/home conditions, with browser-local completion tracking and print/PDF support.

## Current functional contract

- Accept move date, household type (`solo` or `family`), and home type (`rental` or `owned`).
- Accept an optional print-only memo up to 40 characters.
- Generate reference tasks spanning preparation before the move through post-move follow-up.
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
- PDF output is provided through the browser print dialog rather than a dedicated PDF generator.
- The print memo can appear in printed/PDF output even though it is not stored; users should avoid personal information.
- Official municipality, landlord/management, utility, and contract guidance takes precedence.

## Acceptance criteria

- [ ] A valid move date plus household/home type produces a condition-specific checklist and progress state.
- [ ] Checkbox state survives reload for the same condition set but does not leak to a different condition set.
- [ ] The optional print memo is not written to persistent storage.
- [ ] Delete-current and delete-all actions remove the corresponding saved checklist state.
- [ ] Print/PDF uses the browser print flow and does not claim server-generated PDF storage.

## Implementation evidence

- `tools/moving-checklist-generator/index.html`
- `tools/moving-checklist-generator/app.js`
- `tools/moving-checklist-generator/style.css`
