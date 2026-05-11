# EMS-RD-01 Earth Map Suite real precipitation data investigation

## Scope
- Target tool: `tools/earth-map-suite/`
- Minimal Cloudflare Pages Function prototype only if safe: `functions/api/earth-map-suite/precipitation.js`
- Documentation: `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md`
- Do not alter public UI behavior or common layout/monetization blocks.

## Files to inspect
- `tools/earth-map-suite/index.html`
- `tools/earth-map-suite/app.js`
- `tools/earth-map-suite/style.css`
- `tools/earth-map-suite/usage.html`
- `tools/earth-map-suite/usage-en.html`
- `tools/earth-map-suite/README.md`

## High-level steps
1. Inspect the current Earth Map Suite implementation and search for required misleading/source terms.
2. Investigate JAXA/EORC precipitation data availability, browser/CORS feasibility, authentication, response format, and no-fixed-cost constraints.
3. Add a minimal JSON-only Cloudflare Pages Function proof endpoint if it can safely validate inputs and avoid synthetic fallback.
4. Document findings, open questions, commands used, and recommended next task.
5. Run lightweight syntax/static checks and verify the existing UI files remain untouched unless documentation/prototype requires changes.

## Manual verification for user
- Open `tools/earth-map-suite/index.html` and confirm the current preview labels remain unchanged and clearly non-operational/placeholder where applicable.
- Request `/api/earth-map-suite/precipitation?bbox=139.60,35.50,139.95,35.80&start=2026-05-01&end=2026-05-01&preset=low` in a Cloudflare Pages Functions preview environment.
- Confirm any function failure returns `data_type: "unavailable"` and does not include fabricated precipitation values.
