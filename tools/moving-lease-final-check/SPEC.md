# Tool Specification — Moving / Lease Final Check

- Slug: `moving-lease-final-check`
- Public URL: `https://nicheworks.app/tools/moving-lease-final-check/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a final pre-move/pre-vacate checklist for common cancellation, address-change, inspection, photo, meter, and key-return tasks.

## Current functional contract

- Require an exit/move date and accept home type (`rental` or `owned`).
- Generate a final checklist and completion progress for the selected conditions.
- Persist exit date, home type, and checkbox state in the current browser.
- Allow clearing completion state, resetting inputs, deleting the current condition's saved state, and deleting the previously used condition's saved state.
- Allow checklist TXT copy, TXT download, and browser print/PDF.
- Include a non-persistent inspection memo template for inspection date, management contact, keys, meter photos, observed damage/equipment, and agreements.
- Show an Old/NicheWorks shared Pro preview for an expanded Moving / Lease Final Pack; Pro-specific copy/save/print actions are unavailable until the shared entitlement is active.

## Inputs

- Required move/exit date.
- Home type: rental or owned.
- Checklist completion toggles.
- Pro actions when entitlement is active.

## Outputs

- Final checklist and progress indicator.
- TXT copy/download.
- Browser print/PDF output.
- Inspection memo template.
- Pro expanded handoff/share pack when unlocked.

## State and persistence

Exit date, home type, and checklist state are stored browser-locally. They do not sync across devices or browsers. Shared NicheWorks Pro entitlement is browser-bound.

## Privacy and network behavior

Checklist generation and state management are browser-side. Ads/analytics and the external Pro purchase flow may communicate independently. The tool does not send checklist data to a lease-management service.

## Language mode

`Japanese-only`

The current public tool surface and structured language declaration are Japanese-only.

## Layout class

`mobile-oriented`

The primary experience is a short form followed by a checklist, progress bar, outputs, and a vertically stacked Pro preview.

## Limits and non-goals

- The tool does not determine legal responsibility, lease interpretation, restoration obligations, deposit settlement, repair charges, or dispute outcomes.
- Contract documents and property-management guidance take precedence.
- PDF save is provided by the browser print dialog, not server-side PDF generation.
- Pro preview content does not mean Pro actions are available without the shared entitlement.
- Until product-scoped billing migration is explicitly completed for this tool, its legacy paid gate accepts only the shared `nicheworks_pro` entitlement; an active entitlement for another product must not unlock this tool.

## Acceptance criteria

- [ ] A required move/exit date and home type produce the corresponding final checklist.
- [ ] Completion state persists in the browser for the saved condition and can be deleted explicitly.
- [ ] Free TXT copy/download and browser print remain usable independently of Pro.
- [ ] The UI does not present checklist completion as a guarantee about restoration costs, deposits, or legal obligations.
- [ ] A cached active entitlement other than `nicheworks_pro` does not unlock the Pro pack or Pro copy/save/print actions.

## Implementation evidence

- `tools/moving-lease-final-check/index.html`
- `tools/moving-lease-final-check/app.js`
- `tools/moving-lease-final-check/pro-bridge.js`
- `tools/moving-lease-final-check/style.css`
