1. **Goal**
   - Build an offline, canvas-based color replacement tool for `tools/color-replace/` that supports upload, tolerance-based recoloring, preview, and PNG download.
   - Provide clear JA/EN how-to guidance and ensure required DOM elements exist for QA.

2. **Scope**
   - targets:
     - `tools/color-replace/index.html`
     - `tools/color-replace/app.js`
     - `tools/color-replace/style.css`
     - `tools/color-replace/howto/index.html`
     - `tools/color-replace/howto/en/index.html`
     - `tools/color-replace/qa.json`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation additions.
   - No edits outside the scoped files.
   - Do not modify `common-spec/spec-ja.md` or other common spec files.
   - No new external dependencies.

4. **Change List**
   - `index.html`: build required UI elements (file input, canvases, color pickers, tolerance slider, buttons, local-only note), and wire IDs per task.
   - `app.js`: implement offline canvas recolor (tolerance-based color distance), alpha preservation, optional downscale guard for large images, apply/reset/download flows, and update tolerance label.
   - `style.css`: responsive layout, canvas styling, and button/input layout for mobile-friendly usage.
   - `howto/index.html` + `howto/en/index.html`: document steps, best practices, transparency note.
   - `qa.json`: define open-only DOM presence checks and no-console-errors requirement.

5. **Step-by-step Procedure**
   1. Review existing color-replace files for current structure.
   2. Update `index.html` with required controls and canvases.
   3. Implement `app.js` canvas processing logic and UI wiring.
   4. Style the UI in `style.css` for responsive behavior.
   5. Update JA/EN how-to pages with usage steps and notes.
   6. Add `qa.json` for the specified open-only checks.
   7. Sanity check by loading page and simulating recolor in browser (manual).

6. **Test Plan**
   - Open `tools/color-replace/index.html` in a browser.
   - Upload a PNG with transparency and verify recolor and transparency preservation.
   - Adjust tolerance slider and confirm preview updates.
   - Download PNG and verify output.
   - Validate that `#imageFile` and `#applyBtn` exist and no console errors appear.

7. **Rollback Plan**
   - Revert the changes using `git checkout -- <files>` if issues are detected.
