# EMS-RD-02 GSMaP precipitation sampler ExecPlan

## Scope
- `functions/api/earth-map-suite/precipitation.js`
- `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md`
- `tools/earth-map-suite/README.md` if present

## Files to touch
- Implement JSON-only validation and real STAC metadata lookup in `functions/api/earth-map-suite/precipitation.js`.
- Update verified endpoint/status/manual tests in `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md`.
- Add a short endpoint status note to `tools/earth-map-suite/README.md` if it exists.

## High-level steps
1. Inspect existing precipitation function and investigation notes.
2. Verify the candidate STAC endpoint and PRECIP asset naming with small requests.
3. Refactor the function to validate query params, call STAC, discover PRECIP assets, and return JSON-only metadata/error responses without synthetic data.
4. Run syntax checks and targeted manual HTTP checks locally if possible.
5. Commit changes and prepare PR.

## Manual verification for user
- Valid metadata request: `/api/earth-map-suite/precipitation?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-03&preset=low`
- Invalid bbox request: `/api/earth-map-suite/precipitation?bbox=139.5,35.4,139.0,35.9&start=2025-08-01&end=2025-08-03&preset=low`
- Limit exceeded request: `/api/earth-map-suite/precipitation?bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-20&preset=low`
