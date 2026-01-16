1. **Goal**
   - Rebuild the Construction Tools Atlas top page layout for mobile-first and desktop two-column usability with fixed-height scrolling panels, sticky header, and mobile bottom mini-bar, while keeping behavior consistent across index, pages, and howto.
   - Persist light theme by default and ensure theme toggle applies across all Atlas pages without forced resets.

2. **Scope**
   - targets: `tools/construction-tools-atlas/index.html`, `tools/construction-tools-atlas/style.css`, `tools/construction-tools-atlas/app.js`, `tools/construction-tools-atlas/pages/*.html`, `tools/construction-tools-atlas/howto/**`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - No out-of-scope edits.
   - Do not modify `common-spec/spec-ja.md` or other specs.
   - No new external dependencies.

4. **Change List**
   - Update layout structure and classes in `index.html` to enforce sticky header, non-sticky hero/search/filter flow, fixed-height results/detail panels, and mobile fullscreen detail sheet.
   - Update `style.css` to implement light default theme with CSS variables, sticky header with opaque background, fixed-height scroll containers, and mobile bottom mini-bar.
   - Update `app.js` to persist theme (localStorage) across Atlas pages, prevent auto-scroll on selection, and manage mobile modal detail behavior.
   - Update `pages/*.html` and `howto/**` to include consistent theme toggle and donate buttons styled as buttons with required URLs.

5. **Step-by-step Procedure**
   1. Inspect current Atlas HTML/CSS/JS and subpages to understand existing structure.
   2. Modify layout markup to match required structure (header, hero/ad/search/filter, results, detail) with new wrappers/classes.
   3. Implement CSS for sticky header, fixed-height scroll panels, mobile sheet detail, and bottom mini-bar; ensure light default theme.
   4. Update JS for theme persistence and detail panel behavior (no page scroll on select).
   5. Apply consistent header/footer donate buttons and theme toggle across pages/howto.
   6. Review all changed files for scope compliance.

6. **Test Plan**
   - Open index at 360x740: verify light theme, donate visible in first viewport (header or bottom bar), results scroll internally, and detail opens fullscreen with close/back.
   - Open index at 1200x800: verify two-column layout with fixed-height scrolling results/detail, no overlap under filters/search, and header opaque.
   - Navigate between index/pages/howto: verify theme toggle persists and donate buttons appear as buttons.

7. **Rollback Plan**
   - `git restore tools/construction-tools-atlas/index.html tools/construction-tools-atlas/style.css tools/construction-tools-atlas/app.js tools/construction-tools-atlas/pages/*.html tools/construction-tools-atlas/howto/**`
