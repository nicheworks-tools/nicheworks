# EMS-RD-20 Browser Capture Checklist (VERIFY-A)

Purpose: capture the actual deployed browser self-check JSON artifact from `api-status.html` in safe mode.

## Target URL (exact)

`https://nicheworks.app/tools/earth-map-suite/api-status.html?autorun=safe`

## Checklist (actual browser run)

- [ ] Open the exact URL above in a **normal browser** (not mocked or synthetic test output).
- [ ] Wait until the safe check completes on the page.
- [ ] Confirm the endpoints section includes:
  - `self_check`
  - `health`
  - `manifest`
- [ ] Capture the JSON by clicking one of:
  - `Download JSON result`
  - `Copy JSON result`
- [ ] Keep probe execution manual: **do not run research probes yet**.

## Expected safe result fields to verify

The captured result should include these fields (or explicitly null where applicable):

- `data_type`
- `mode`
- `checked_at`
- `page_url`
- `branch_decision`
- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`
- `endpoints`
- `result_hash` (or `null`)

## Handling rules

- Endpoint values must be copied as-is from browser output and **must not be edited manually**.
- The captured JSON must be pasted into EMS-RD-20 intake in a later task (`ems-rd-20-browser-safe-result.json`).

## Guardrails

- Documentation/process guidance only.
- No endpoint code changes.
- No `api-status` behavior changes.
- No Storm / Compare / Card connection.
- No public real data enablement.
- This checklist does **not** claim real precipitation is working.
