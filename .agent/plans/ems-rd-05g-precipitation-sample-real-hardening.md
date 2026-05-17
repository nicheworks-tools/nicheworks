# EMS-RD-05G precipitation-sample-real hardening

## Scope
- Target implementation: `functions/api/earth-map-suite/precipitation-sample-real.js`.
- Target harness: `functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs`.
- Documentation reference only: `tools/earth-map-suite/EMS_RD_04_ERROR_HANDLING.md`.
- No public UI changes. No `tools/earth-map-suite/app.js` changes. No dependencies.

## Files to touch
- `.agent/plans/ems-rd-05g-precipitation-sample-real-hardening.md`
- `functions/api/earth-map-suite/precipitation-sample-real.js`
- `functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs`

## Steps
1. Inspect current endpoint and harness behavior for validation, method handling, and unavailable response contract.
2. Enforce GET-only handling with canonical `method_not_allowed` unavailable/error responses where supported.
3. Keep current low-preset, one-day, and 0.5-degree bbox limits; ensure each validation failure returns canonical guidance.
4. Remove any successful/research-only output path from `precipitation-sample-real`; valid inputs must remain `validated_sampling_not_ready` unavailable/error until validation is complete.
5. Extend harness coverage for missing bbox, invalid bbox, too-large bbox, multi-day range, unsupported preset, POST/non-GET method, safe valid requests, and upstream failure.
6. Run syntax checks and harness.

## Manual verification for user
- Request missing/invalid/oversized/multi-day/unsupported preset inputs and verify `data_type: unavailable`, `status: error`, `error_code`, `message`, and `guidance` are present.
- Request a syntactically valid low/one-day/small-bbox sample and verify it remains `validated_sampling_not_ready` with no mean/min/max values or synthetic output.
