# EMS-RD-04F Storm Metadata JS Fix

## Scope
- `tools/earth-map-suite/app.js`
- `tools/earth-map-suite/index.html` only if required for missing IDs/hooks
- `tools/earth-map-suite/style.css` only if required for minor visibility fixes

Do not touch the precipitation API endpoint unless a clear integration mismatch is found.

## Goal
Fix Earth Map Suite storm mode so Run storm fetches GSMaP metadata, safely renders success/error state, and draws synthetic storm preview canvases without affecting compare/card mode separation.

## Steps
1. Inspect current storm mode URL parsing, validation, run handler, replay drawing, metadata fetch, and rendering code.
2. Patch the minimal JS wiring/rendering bug(s) in `app.js`.
3. Verify endpoint URL construction, safe text rendering, mode-specific validation, and mode visibility.
4. Run automated syntax/available project checks.
5. Manually simulate valid storm response, invalid bbox response, and mode switching where possible in local/static environment.

## Manual verification for user
1. Open `/tools/earth-map-suite/?mode=storm&bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-03&preset=low`.
2. Confirm storm fields populate and storm panels show while compare/card panels remain hidden.
3. Press Run storm and confirm metadata fields and synthetic canvases render.
4. Try invalid bbox and confirm metadata error details are visible.
5. Switch Compare/Card and confirm storm metadata hides.
