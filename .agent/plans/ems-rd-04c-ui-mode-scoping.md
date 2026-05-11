# EMS-RD-04C Earth Map Suite UI mode scoping rebuild

## Scope
- Rebuild the static Earth Map Suite tool layout and mode scoping only.
- Target files:
  - `tools/earth-map-suite/index.html`
  - `tools/earth-map-suite/app.js`
  - `tools/earth-map-suite/style.css`
  - `tools/earth-map-suite/usage.html` / `usage-en.html` only if wording needs clarification.
  - `tools/earth-map-suite/REAL_DATA_INVESTIGATION.md` only if metadata status notes need clarification.
- Do not change the precipitation endpoint unless a direct UI compatibility bug requires it.

## Steps
1. Inspect existing DOM, CSS display rules, run handler, validation, and storm metadata rendering.
2. Restructure inputs into explicit `data-input-mode` panels and results into explicit `data-result-mode` panels.
3. Use a single current-mode state on `document.documentElement.dataset.currentMode` for CSS/JS scoping.
4. Build responsive CSS for 3-column desktop, 2-column standard desktop, and mobile card/accordion layouts.
5. Keep storm metadata-only status separate from synthetic replay and downloads.
6. Keep validation mode-aware so hidden mode fields are not validated.
7. Run syntax checks, SEO repair no-diff check, and targeted behavior assertions.

## Manual verification
1. Open `/tools/earth-map-suite/?mode=storm&bbox=139.5,35.4,140.0,35.9&start=2025-08-01&end=2025-08-03&preset=low`.
2. Confirm only storm inputs/results are visible, metadata shows GSMaP reachable with dataset/matched_dates/sampling_status, and synthetic preview says not observed precipitation.
3. Switch to compare and confirm storm metadata/replay and card UI are hidden while compare input/result are visible.
4. Switch to card and confirm storm/compare UI are hidden while card input/result are visible.
5. Check 320, 360, 480, 768, 960, and 1200px widths for no horizontal overflow and usable buttons.
