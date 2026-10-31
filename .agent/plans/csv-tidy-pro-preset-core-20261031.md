# ExecPlan — CSV Tidy Pro local preset core (2026-10-31)

## Goal

Implement and verify the **first actual Pro capability's internal library**: a versioned, privacy-preserving, exact-schema mapping preset. Keep CSV Tidy Free code, public UI, Stripe and entitlement gates entirely unchanged. PR #1422 registered a non-purchasable planning product; this PR must not enable sales.

## Scope (only)

- `tools/csv-tidy/pro/preset-core.mjs`: pure browser/Node-compatible ESM functions for capturing, validating, serializing, importing, and planning deterministic application of a mapping preset.
- `tools/csv-tidy/tests/pro-preset-core.mjs`: independent tests for duplicate and empty headers, positional column mapping, mismatches, tampered presets, options and round trips.
- `.github/workflows/csv-tidy-pro-preset-core.yml`: CI without external packages.
- `tools/csv-tidy/PRO-SPEC.md`: add status/correctness boundary as appropriate.
- This plan.

## Safety and compatibility

- No production CSV Tidy Free HTML/JS/CSS changes and no new product surface/price display.
- Input header signature is exact source-header text (not output headers). Header OFF uses first data record width without invented header names. No silent matching by duplicated column name.
- Reject changed width, header order/value or header mode before applying; no partial mutation.
- Preserve every position, including excluded columns, duplicate headers, blank names, and unchecked-cleaning selections.
- Store **no data rows or file bytes** in a preset; optional local persistence only in a later UI wave.
- Limit JSON size and reject unknown schema/unsafe values; parsing data does not execute code.
- Execution adapter for reuse of production CSV parse/serialize is a future separate implementation. No claim that bulk processing, licensing, real purchase/recovery or Pro UI is complete.

## Acceptance

- Valid preset round-trips without changing mapping or options.
- Exact source header succeeds; changed order/name/width/header mode rejects with explicit reason.
- Duplicate/blank headers remain positionally independent, no accidental name-based collapse.
- Invalid order/srcIndex/invalid option/schema rejects without side effects.
- Tests green in Node and repository CI. Do not merge until verified.
