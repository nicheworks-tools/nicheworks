# EMS-RD-05D Validated Sample Prototype Plan

## Scope
- Target: `functions/api/earth-map-suite/precipitation-sample-real.js`
- Related local harness: `functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs`
- Read-only references: `functions/api/earth-map-suite/probe-status.js`, `functions/api/earth-map-suite/precipitation-pixel-probe.js`, `tools/earth-map-suite/EMS_RD_04_UNIT_NODATA_SCALE.md`, `tools/earth-map-suite/EMS_RD_04_SAMPLE_RESPONSE_CONTRACT.md`

## Files to touch
- `functions/api/earth-map-suite/precipitation-sample-real.js`
- `functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs`

## Steps
1. Inspect probe-status classification and sample response/unit validation contracts.
2. Update `precipitation-sample-real` so valid requests run/read the pixel-probe classification before deciding readiness.
3. Keep not-ready responses strict with `validated_sampling_not_ready`, `validated_sample_ready: false`, and an explicit `readiness_blocker`.
4. If `decision.phase === "raw_pixel_read"`, return a research-only readiness response with `debug_first_pixel` only; do not compute/return real mean/min/max or public real-observation data.
5. Extend the local harness to cover both raw-pixel-read and not-ready branches without network or synthetic fallback.
6. Run syntax checks and the harness, then commit and open one PR.

## Manual verification
- Run `node --check functions/api/earth-map-suite/precipitation-sample-real.js`.
- Run `node --check functions/api/earth-map-suite/probe-status.js`.
- Run `node functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs`.
