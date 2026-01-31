1. **Goal**
   - Implement Storm Replay mode (storm) UI/data pipeline/outputs for `tools/earth-map-suite`, following existing tool behavior and NicheWorks spec (no cross-tool nav, no new deps).

2. **Scope**
   - targets: `tools/earth-map-suite/index.html`, `tools/earth-map-suite/style.css`, `tools/earth-map-suite/app.js`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation or header nav additions.
   - Do not edit out-of-scope files.
   - Do not modify common-spec files.
   - Do not add new external dependencies.

4. **Change List**
   - `index.html`: add Storm Replay UI controls (bbox/start/end/preset, timeline controls, download buttons, status messaging) within existing layout.
   - `style.css`: add styles for timeline, status messages, download buttons, and cumulative view layout.
   - `app.js`: implement storm replay data pipeline (frame fetching, auto frame thinning <= 48, cumulative aggregation), memoized caching, timeline navigation, and download handlers for PNG/CSV.

5. **Step-by-step Procedure**
   1. Inspect current earth-map-suite UI and data flow.
   2. Implement UI controls in HTML and related styles in CSS.
   3. Add data pipeline logic, caching, frame thinning, cumulative aggregation, and download utilities in JS.
   4. Wire UI events to pipeline and validate in browser.

6. **Test Plan**
   - Load the tool in a browser, run a storm replay with a sample bbox/time range.
   - Verify timeline navigation, timestamp display, cumulative view toggle, and download buttons.
   - Confirm frame thinning when frame count exceeds 48 and that an actionable limit message appears.

7. **Rollback Plan**
   - Revert the three edited files with `git checkout -- tools/earth-map-suite/index.html tools/earth-map-suite/style.css tools/earth-map-suite/app.js`.
