# Tool Specification — Moving / Lease Final Check

- Slug: `moving-lease-final-check`
- Public URL: `https://nicheworks.app/tools/moving-lease-final-check/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a final pre-move/pre-vacate checklist for common cancellation, inspection, photo, meter, key-return, and handoff tasks immediately around move-out.

### Search and product scope boundary

This tool is the final-stage move-out / pre-vacate surface. Its primary intent is the last checks around inspection, photo records, utility-meter records, key return, cancellation confirmation, and handoff notes.

`moving-checklist-generator` is the separate broad moving-timeline surface covering planning from 30 days before the move through post-move follow-up, including address changes, government procedures, utilities, packing, and moving-day preparation. The two tools may reference overlapping moving-day tasks, but their primary search intent and product role MUST remain distinct.

## Current functional contract

- Require an exit/move date and accept home type (`rental` or `owned`).
- Generate a final checklist and completion progress for the selected conditions.
- Persist exit date, home type, and checkbox state in the current browser.
- Allow clearing completion state, resetting inputs, deleting the current condition's saved state, and deleting the previously used condition's saved state.
- Allow checklist TXT copy, TXT download, and browser print/PDF.
- Include a non-persistent inspection memo template for inspection date, management contact, keys, meter photos, observed damage/equipment, and agreements.
- Do not require or load any NicheWorks Pro entitlement, paid unlock, or product-specific payment bridge.

## Inputs

- Required move/exit date.
- Home type: rental or owned.
- Checklist completion toggles.

## Outputs

- Final checklist and progress indicator.
- TXT copy/download.
- Browser print/PDF output.
- Inspection memo template.

## State and persistence

Exit date, home type, and checklist state are stored browser-locally. They do not sync across devices or browsers.

## Privacy and network behavior

Checklist generation and state management are browser-side. Ads/analytics can load independently. The tool does not send checklist data to a lease-management service or a payment/entitlement service.

## Language mode

`Japanese-only`

The current public tool surface and structured language declaration are Japanese-only.

## Layout class

`mobile-oriented`

The primary experience is a short form followed by a checklist, progress bar, outputs, and inspection memo.

## Limits and non-goals

- This is not the broad 30-day moving planner; use `moving-checklist-generator` for the full preparation-through-post-move timeline.
- The tool does not determine legal responsibility, lease interpretation, restoration obligations, deposit settlement, repair charges, or dispute outcomes.
- Contract documents and property-management guidance take precedence.
- PDF save is provided by the browser print dialog, not server-side PDF generation.

## Acceptance criteria

- [ ] A required move/exit date and home type produce the corresponding final checklist.
- [ ] Completion state persists in the browser for the saved condition and can be deleted explicitly.
- [ ] TXT copy/download and browser print remain usable without any paid entitlement.
- [ ] The UI does not present checklist completion as a guarantee about restoration costs, deposits, or legal obligations.
- [ ] The public page does not load or expose the retired shared-Pro purchase/entitlement flow.
- [ ] Public positioning remains final-stage move-out / pre-vacate checking rather than a broad moving timeline.
- [ ] The page continues to link to `moving-checklist-generator` for earlier preparation.

## Implementation evidence

- `tools/moving-lease-final-check/index.html`
- `tools/moving-lease-final-check/app.js`
- `tools/moving-lease-final-check/style.css`
