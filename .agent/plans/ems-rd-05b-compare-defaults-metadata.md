# EMS-RD-05B Earth Map Suite Compare defaults and metadata rendering

## Scope
- Target only Earth Map Suite static files and notes as needed:
  - `tools/earth-map-suite/app.js`
  - `tools/earth-map-suite/index.html` if hardcoded defaults/copy are found
  - `tools/earth-map-suite/style.css` only for minor visibility/layout fixes
  - `tools/earth-map-suite/usage.html`
  - `tools/earth-map-suite/usage-en.html`
  - `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md` if status notes need updating
- Do not modify unrelated tools, apps, specs, endpoint limits, GA/AdSense/donation/usage links, or deployment settings.

## Files expected to touch
- Start by inspecting `tools/earth-map-suite/app.js` and Earth Map Suite docs for legacy compare defaults and placeholder metadata copy.
- Touch only files needed to remove legacy defaults, update compare metadata rendering, and document current behavior.

## High-level steps
1. Inspect existing Compare mode defaults, example button flow, URL/state restoration, Run compare behavior, and metadata rendering.
2. Replace legacy Osaka/2024/mid defaults with the verified Tokyo/2025/low metadata-safe example.
3. Add or adjust legacy-default detection so exact restored legacy values are replaced by the verified example, without altering arbitrary user-entered invalid ranges.
4. Ensure Compare metadata panel has Compare-specific initial copy and renders independent A/B metadata success/error status while leaving maps synthetic preview only.
5. Update Earth Map Suite usage docs/notes if they contain old defaults or outdated compare metadata wording.
6. Run syntax/SEO checks and targeted searches requested by the task; document any unrelated/environment limitations.

## Manual verification for user
1. Open `/tools/earth-map-suite/` and switch to Compare.
2. Confirm initial values are bbox `139.5,35.4,140.0,35.9`, A `2025-08-01`→`2025-08-03`, B `2025-08-04`→`2025-08-06`, preset `low`.
3. Press Run compare and confirm Compare-specific metadata status for A/B with synthetic preview labels; Storm metadata and Card result remain hidden.
4. Manually enter the old legacy values and press Run compare; confirm endpoint errors/limit status are visible and synthetic preview is not labeled real.
