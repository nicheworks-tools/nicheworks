# EMS-RD-05E precipitation-sample-real validation metadata

## Scope
- Target: `functions/api/earth-map-suite/precipitation-sample-real.js`
- Reference only: `tools/earth-map-suite/EMS_RD_04_UNIT_NODATA_SCALE.md`, `tools/earth-map-suite/EMS_RD_04_SAMPLE_RESPONSE_CONTRACT.md`
- No UI files, `app.js`, dependencies, deployment, or common spec files.

## Files to touch
- `functions/api/earth-map-suite/precipitation-sample-real.js`

## Steps
1. Inspect current endpoint response/error helpers and EMS RD-04 docs for readiness/status contract.
2. Add a small helper to construct validation readiness metadata consistently.
3. Ensure all responses expose `unit_status`, `scale_status`, `offset_status`, `nodata_status`, `geolocation_status`, and `validation_status`.
4. Keep validation blocked as `not_ready_for_public_real_output` unless all required metadata is verified; do not emit `data_type: real_observation` while readiness is pending.
5. Add/extend local assertions in the same module for default blocked response, valid request blocked response, and canonical invalid-parameter errors.
6. Run syntax checks and available local tests/assertions, then commit and create one PR.

## Manual verification
- Call the endpoint with no/valid params and confirm readiness fields are present and public real output remains blocked.
- Call the endpoint with invalid bbox/date params and confirm canonical error response shape is preserved with readiness metadata.
