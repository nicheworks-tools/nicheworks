1. **Goal**
   - Improve mobile readability and spacing rhythm inside the UI Atlas detail panel without changing overall layout or behavior.

2. **Scope**
   - targets: `tools/ui-atlas/styles.css`, `tools/ui-atlas/index.html`, `tools/ui-atlas/ja/index.html`
   - excluded: all other folders/files

3. **Rules / Prohibitions**
   - No redesign of the full page and no new features.
   - Keep live sample system and all current behaviors intact.
   - Keep EN/JA parity for detail readability improvements.
   - Keep desktop layout unchanged except for tiny safe adjustments if needed.

4. **Change List**
   - Add mobile-focused detail-sheet spacing and readable content constraints.
   - Improve spacing rhythm between close button, title, sample, and section blocks.
   - Ensure detail text blocks feel inset and not full-bleed while preserving sample usability.

5. **Step-by-step Procedure**
   1. Inspect current detail structure and mobile CSS rules.
   2. Add focused mobile-only detail panel spacing/readability styles.
   3. Verify no desktop regression and no behavior-impacting markup changes.
   4. Run quick checks (git diff/status) and prepare commit.

6. **Test Plan**
   - Confirm styles compile/load (no syntax errors in CSS).
   - Manually verify in code that detail open/close and sample selectors are unchanged.
   - Review diff for EN/JA parity and mobile-only targeting.

7. **Rollback Plan**
   - Revert the commit with `git revert <commit>` if regressions appear.
