# ExecPlan: EMS-RD-04D precipitation sample real skeleton

## Scope
- Add a single Cloudflare Pages Function endpoint under `functions/api/earth-map-suite/`.
- Do not modify public UI, Storm, Compare, Card, payment, checkout, specs, or tool folders.

## Files to touch
- `functions/api/earth-map-suite/precipitation-sample-real.js` (new)

## High-level steps
1. Inspect existing Earth Map Suite probe endpoints for response style and validation patterns.
2. Add the new GET endpoint skeleton with strict query validation:
   - `bbox`, `start`, and `end` required.
   - `preset` defaults to `low`.
   - `start` and `end` must be the same valid `YYYY-MM-DD` date.
   - bbox must have four finite numeric values, min < max, and max 0.5 degrees per axis.
3. Reuse current research readiness semantics only as a readiness gate; do not decode or fabricate values.
4. Return a safe unavailable response with the future real response contract placeholders.
5. Run syntax/import checks and focused endpoint behavior checks without adding dependencies.
6. Commit the change and create one PR.

## Manual verification
- Call `/api/earth-map-suite/precipitation-sample-real?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-01&preset=low` and verify it returns `status: "error"`, `data_type: "unavailable"`, `error_code: "validated_sampling_not_ready"`, and null precipitation statistics.
- Try missing/invalid query parameters and verify safe validation errors.
