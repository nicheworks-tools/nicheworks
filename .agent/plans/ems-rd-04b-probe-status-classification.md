# EMS-RD-04B probe-status classification hardening

## Scope
- `functions/api/earth-map-suite/precipitation-pixel-probe.js`
- `functions/api/earth-map-suite/probe-status.js`

Do not touch public Storm / Compare / Card UI files, app.js, common specs, deployment settings, or archived files.

## Goal
Make `/api/earth-map-suite/probe-status` always return a compact research-only decision object that can branch all known pixel-probe outcomes without implying public precipitation readiness.

## Steps
1. Inspect the existing pixel probe response/error shapes and any current probe-status route presence.
2. Add or update the probe-status route to call the pixel probe logic over the same request, preserve the original summary fields, and classify into:
   - `raw_pixel_read`
   - `decoder_strategy_required`
   - `blocked`
   - `inconclusive`
   - `endpoint_error`
3. Treat `null`, `undefined`, and non-numeric `first_pixel` as non-success; never classify those as `raw_pixel_read`.
4. Return a decision object with `phase`, `next`, `reason`, and `can_continue_to_public_ui: false` for every response.
5. Keep the endpoint research-only; do not connect it to app.js or public UI; add no dependencies.
6. Test by exercising classifier branches locally with Node/module imports and by checking git diff for touched files.

## Manual verification
- Request `/api/earth-map-suite/probe-status?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01` after deployment.
- Confirm the JSON has `data_type: earth_map_suite_probe_status`, `status: ok`, and a `decision` object with `can_continue_to_public_ui: false`.
- Confirm public Earth Map Suite UI files remain unchanged.
