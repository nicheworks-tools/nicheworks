1. **Goal**
   - Add completion-grade explainability (breakdown + why text), actionable advice blocks, validation, presets, and copy summary for tools/dry-meter.
   - No common spec changes; only tool-specific UX per task.

2. **Scope**
   - targets:
     - `tools/dry-meter/index.html`
     - `tools/dry-meter/app.js`
     - `tools/dry-meter/style.css`
     - (optional) `tools/dry-meter/howto/index.html`
     - (optional) `tools/dry-meter/howto/en/index.html`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - No out-of-scope edits.
   - Do not modify common-spec files.
   - Do not introduce new external dependencies.

4. **Change List**
   - `index.html`: add containers for breakdown, why text, action blocks, validation errors, presets, and copy summary button.
   - `app.js`: implement score breakdown computation, why explanation, action block logic with thresholds, input validation + friendly errors, presets, and copy-to-clipboard summary.
   - `style.css`: style new sections (breakdown list, advice cards, errors, presets, copy button).
   - howto pages: update only if needed to describe new features.

5. **Step-by-step Procedure**
   1. Inspect existing dry-meter HTML/JS/CSS.
   2. Extend HTML with new sections and buttons.
   3. Implement JS logic for breakdown, explainability, validation, presets, and copy summary.
   4. Add CSS styling for new UI.
   5. Ensure no UI breaks and validate behavior for invalid inputs.

6. **Test Plan**
   - Open `tools/dry-meter/index.html` in a browser.
   - Verify breakdown and “why” text appear after calculation.
   - Check advice blocks change with different inputs/presets.
   - Enter invalid values to confirm friendly errors (no NaN).
   - Test “Copy summary” button.

7. **Rollback Plan**
   - Revert the commit to restore previous dry-meter behavior.
