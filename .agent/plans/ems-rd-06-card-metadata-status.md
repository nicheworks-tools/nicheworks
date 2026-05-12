# EMS-RD-06 Card Metadata Status ExecPlan

## Scope
- Target implementation: `tools/earth-map-suite/index.html`, `tools/earth-map-suite/app.js`, `tools/earth-map-suite/style.css`, `tools/earth-map-suite/usage.html`, `tools/earth-map-suite/usage-en.html`.
- Optional documentation update: `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md` if implementation status needs clarification.
- Validation-only reference: `functions/api/earth-map-suite/precipitation.js`.
- Do not touch Storm/Compare behavior except shared helpers required by Card metadata rendering/fetching.

## Steps
1. Inspect current Earth Map Suite Card, Storm, and Compare mode structure, result panel IDs, synthetic preview generation, CSV export, analytics helper, and metadata endpoint response shape.
2. Add a Card-only metadata status panel separated from the synthetic location/card output.
3. Implement Card-only validation, point bbox construction with preset deltas and lat/lon clamping, metadata endpoint fetch, success/error rendering, and privacy-safe analytics event if helper exists.
4. Update Card example/default values to Tokyo valid metadata-safe example.
5. Extend Card CSV with synthetic-preview data type and metadata status fields without implying observed point precipitation.
6. Update usage docs/status notes with metadata-only Card wording if needed.
7. Run automated checks and targeted endpoint smoke checks where possible.

## Manual Verification for User
- Open `/tools/earth-map-suite/`, switch to Card, click Card example, run Card, and confirm metadata-only success fields and synthetic-preview labeling.
- Test invalid Card range (`2025-08-01` to `2025-08-20`, preset `low`) and confirm the Card metadata panel shows the endpoint error while synthetic preview remains synthetic.
- Switch between Storm/Card/Compare and confirm non-active mode result panels remain hidden.
