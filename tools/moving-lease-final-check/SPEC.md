# Tool Specification — Moving / Lease Final Check

- Slug: `moving-lease-final-check`
- Public URL: `https://nicheworks.app/tools/moving-lease-final-check/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a final-stage move-out / handoff checklist for inspection, photo records, meters, keys, return items, remaining belongings, and handoff notes immediately before leaving or transferring a home.

### Search and product scope boundary

This tool is the final-stage `退去前チェックリスト` / move-out-handoff surface. Its primary intent is the last checks immediately before inspection, key return, final exit, or property handoff.

`moving-checklist-generator` is the separate broad moving-timeline surface covering planning from 30 days before the move through post-move follow-up, including address changes, government procedures, utilities planning, packing, and general moving-day preparation.

The Moving / Lease Final Check MUST NOT duplicate broad address-change, postal-forwarding, municipal-procedure, school/workplace, or early packing tasks. Those belong to `moving-checklist-generator`.

Rental is the primary public search intent. The `owned` mode remains available only for final property handoff / vacancy checks such as keys, equipment, photos, shutoff points, continuing contracts, and final locking.

## Current functional contract

- Require an exit/handoff date and accept home type (`rental` or `owned`).
- Generate a final-stage checklist and completion progress for the selected conditions.
- Keep a crawlable static move-out guide in the initial HTML covering inspection/handoff timing, keys/return items, condition photos, meter checks, remaining belongings, and the contract-guidance boundary.
- Rental output focuses on inspection timing, key return, room/equipment photos, meter records, insurance/contract confirmation, refund contact details, return items, and restoration-related source checking.
- Owned output focuses on final shutoff/locking, handoff documents/keys, condition photos, handoff contacts, vacancy setup, continuing contracts, equipment condition, and record retention.
- Persist exit/handoff date, home type, and checkbox state in the current browser.
- Allow clearing completion state, resetting inputs, deleting the current condition's saved state, and deleting the previously used condition's saved state.
- Allow checklist TXT copy, TXT download, and browser print/PDF.
- Include a non-persistent inspection/handoff memo template for date/time, contact, keys, meter photos, observed damage/equipment, and shared notes.
- Do not require or load any NicheWorks Pro entitlement, paid unlock, or product-specific payment bridge.

## Inputs

- Required move-out / handoff date.
- Home type: rental or owned.
- Checklist completion toggles.

## Outputs

- Final-stage checklist and progress indicator.
- TXT copy/download.
- Browser print/PDF output.
- Inspection / handoff memo template.

## State and persistence

Exit/handoff date, home type, and checklist state are stored browser-locally. They do not sync across devices or browsers.

## Privacy and network behavior

Checklist generation and state management are browser-side. Ads/analytics can load independently. The tool does not send checklist data to a lease-management service or a payment/entitlement service.

## Language mode

`Japanese-only`

The current public tool surface and structured language declaration are Japanese-only.

## Layout class

`mobile-oriented`

The primary experience is a short form followed by a final-stage checklist, progress bar, outputs, and inspection/handoff memo.

## Affiliate boundary

The canonical monetization class is `AFFILIATE`. The live commerce block uses the validated NicheWorks Amazon Japan tagged-search template with tracking ID `nicheworks09-22` and fixed general move-out/handoff-supply queries only. Exit date, home type, checklist state, inspection notes, and progress never enter an Amazon URL. The checklist result must not be used to diagnose a need to buy a product or to infer lease/restoration obligations.

## Limits and non-goals

- This is not the broad 30-day moving planner; use `moving-checklist-generator` for address changes, municipal procedures, utilities planning, packing, and the full preparation-through-post-move timeline.
- The tool does not determine legal responsibility, lease interpretation, restoration obligations, deposit settlement, repair charges, or dispute outcomes.
- Contract documents and property-management guidance take precedence.
- PDF save is provided by the browser print dialog, not server-side PDF generation.

## Acceptance criteria

- [ ] A required exit/handoff date and home type produce the corresponding final-stage checklist.
- [ ] Rental tasks remain centered on inspection/photo/key/return/handoff work rather than broad moving preparation.
- [ ] Initial HTML exposes the core move-out checking topics without requiring checklist generation and keeps restoration, deposit, and legal judgments out of scope.
- [ ] Owned tasks remain centered on property handoff/vacancy finalization rather than broad address or municipal procedures.
- [ ] Completion state persists in the browser for the saved condition and can be deleted explicitly.
- [ ] TXT copy/download and browser print remain usable without any paid entitlement.
- [ ] The UI does not present checklist completion as a guarantee about restoration costs, deposits, or legal obligations.
- [ ] The public page does not load or expose the retired shared-Pro purchase/entitlement flow.
- [ ] The page explicitly sends broad moving preparation to `moving-checklist-generator`.
- [ ] The active Amazon block uses only fixed general handoff-supply queries and the shared `nicheworks09-22` tagged-search template; it does not infer lease or restoration requirements.

## Implementation evidence

- `tools/moving-lease-final-check/index.html`
- `tools/moving-lease-final-check/app.js`
- `tools/moving-lease-final-check/style.css`
- `tools/moving-lease-final-check/affiliate-config.js`
