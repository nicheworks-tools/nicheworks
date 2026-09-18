# Old Kanji Completion Wave 17 — Measurement completion

Date: 2026-09-18

## Goal

Close the Old Kanji measurement/affiliate-contract tranche without expanding telemetry or activating dormant Amazon surfaces.

## Starting state

- Waves 10–16 are complete.
- Cluster analytics already measures coarse handoff/support/enabled-Pro actions.
- Shared Amazon runtime uses `affiliate_outbound`.
- Canonical monetization classifies Old Kanji Reference as `ADS_DONATION` and Old Kanji OCR Scanner as `HOLD`.
- Both Old Kanji Amazon configs are fail-closed.

## Confirmed drift

1. `tools/OLD_KANJI_MEASUREMENT.md` and its checker still referred to historical `affiliate_click`.
2. Reference and OCR SPECs still described live fixed Amazon searches/tracking IDs despite disabled production configs and non-affiliate canonical classification.
3. The cluster contract still described those historical Amazon surfaces as currently available.

## Changes

- Align measurement documentation/checker on shared `affiliate_outbound`.
- Explicitly forbid duplicate affiliate measurement in `assets/old-kanji-analytics.js`.
- Record the current dormant Amazon state in the cluster contract.
- Reconcile Reference/OCR SPECs with canonical monetization and fail-closed configs.
- Close the corresponding completion-ledger criteria.

## Guardrails

- No Amazon activation.
- No monetization classification changes.
- No new analytics event that carries user payload.
- No searched kanji, name, address, OCR text, document text, image metadata, conversion content, storage values, or query strings in measurement payloads.
- No dictionary, SEO inventory, billing, or unrelated tool changes.

## Validation

- Tool runtime contract audit must remain green.
- Old Kanji measurement checker must pass.
- Old Kanji Amazon dormant-contract checker must pass.
- Existing behavior/browser/search/dictionary checks must remain green.
