1. **Goal**
   - Implement unified status UI (idle/loading/success/error) and auto-scroll to results for Earth Map Suite.

2. **Scope**
   - targets: `tools/earth-map-suite/app.js`, `tools/earth-map-suite/style.css`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - No out-of-scope edits.
   - Do not modify common specs.
   - Do not add external dependencies.

4. **Change List**
   - `tools/earth-map-suite/app.js`: centralize state rendering logic for idle/loading/success/error, add example nudge in idle, include error code + guidance, and auto-scroll to results on run.
   - `tools/earth-map-suite/style.css`: add shared status styles for unified UI across modes.

5. **Step-by-step Procedure**
   1. Inspect current status/result rendering in `app.js`.
   2. Refactor to a single status render function that handles all states.
   3. Add auto-scroll behavior after starting a run or after rendering results.
   4. Update CSS to support unified status blocks.

6. **Test Plan**
   - Run the tool in a browser and verify:
     - idle shows example nudge,
     - loading shows consistent status style,
     - success shows results and status block,
     - error shows code + guidance,
     - auto-scroll moves view to results on run.

7. **Rollback Plan**
   - Revert the two modified files with `git checkout -- tools/earth-map-suite/app.js tools/earth-map-suite/style.css`.
