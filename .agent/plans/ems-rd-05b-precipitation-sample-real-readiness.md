# ExecPlan: EMS-RD-05B precipitation-sample-real readiness connection check

## Scope
- Target function: `functions/api/earth-map-suite/precipitation-sample-real.js`
- Related function files for compatibility/syntax checks:
  - `functions/api/earth-map-suite/probe-status.js`
  - `functions/api/earth-map-suite/precipitation-pixel-probe.js`
- Contract/reference docs are read-only unless a test harness needs citation; do not edit docs.
- Do not touch public UI, `app.js`, payment, or checkout code.

## Files to touch
- `functions/api/earth-map-suite/precipitation-sample-real.js`
- A focused local test/harness file only if needed, under an existing test location or a minimal repo-local script path.

## Steps
1. Inspect target implementation and related status/probe helpers.
2. Compare target response shape against EMS_RD_04 sample/error contracts.
3. Update `precipitation-sample-real.js` only as needed to enforce request validation, safe unavailable response, explicit null placeholders, no synthetic precipitation values, and readiness decision passthrough.
4. Add/update a focused local test harness if no matching test exists.
5. Run syntax checks for touched function files and the focused tests/harness.
6. Commit changes and create one PR.

## Manual verification
- Call the function with missing `bbox`, `start`, or `end` and confirm 400 validation errors.
- Call with preset omitted and confirm it defaults to low.
- Call with valid same-day low preset bbox <= 0.5 degrees and confirm response is unavailable/error with `validated_sampling_not_ready`, explicit null metric fields, no mean/min/max precipitation values, and readiness from `probe-status` when available.
