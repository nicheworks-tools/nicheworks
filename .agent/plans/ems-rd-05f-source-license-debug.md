# EMS-RD-05F source/license/debug response plan

## Scope
- `functions/api/earth-map-suite/precipitation-sample-real.js`
- `functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs`

## Files not in scope
- `tools/earth-map-suite/app.js`
- Public Storm / Compare / Card UI files
- Checkout/payment/dependency files
- Common spec files and `_archive/`

## Steps
1. Inspect existing sample-real response and EMS-RD-04 source/license/sample contracts.
2. Add stable provenance metadata and debug gate fields to every sample-real response path without enabling public UI.
3. Preserve existing top-level compatibility fields for dataset/source/license/retrieval/processing.
4. Extend the existing no-dependency harness assertions for invalid, readiness-blocked, and research not-ready responses.
5. Run syntax checks and the harness, then commit and open one PR.

## Manual verification for user
- Call `/api/earth-map-suite/precipitation-sample-real` with invalid params and with a valid low preset request.
- Confirm `provenance` is present, `debug.public_ui_allowed` is `false`, and no public UI has been connected.
