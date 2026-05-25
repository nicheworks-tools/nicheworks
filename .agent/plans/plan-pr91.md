1. **Goal**
   - Fix Construction Tools Atlas scrolling regression and unify Light/Dark theming across all pages with localStorage persistence, defaulting to Light on first visit.

2. **Scope**
   - targets: `tools/construction-tools-atlas/index.html`
   - targets: `tools/construction-tools-atlas/style.css`
   - targets: `tools/construction-tools-atlas/app.js`
   - targets: `tools/construction-tools-atlas/pages/*.html`
   - targets: `tools/construction-tools-atlas/howto/**`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation additions.
   - No out-of-scope edits.
   - Do not modify `common-spec/spec-ja.md` or other specs.
   - Do not add new external dependencies.

4. **Change List**
   - Add inline head script on every static page to set `document.documentElement.dataset.theme` from `localStorage.nw_theme` (default `light`) before paint.
   - Refactor theme CSS variables in `style.css` for consistent light/dark surfaces and apply variables across page components.
   - Adjust layout CSS to remove scroll-blocking overflow/height combos and ensure scroll works on desktop/mobile.
   - Update theme toggle handling in `app.js` to read/write `nw_theme` and update UI state.

5. **Step-by-step Procedure**
   1. Inspect current HTML/CSS/JS for layout and theme handling.
   2. Implement inline theme bootstrap script in `<head>` of all tool pages.
   3. Update CSS variables and component styles for light/dark consistency and scrolling.
   4. Update JS theme toggle to persist and sync label/state.
   5. Verify pages for scroll and theme persistence.

6. **Test Plan**
   - Open `tools/construction-tools-atlas/index.html` and verify default Light theme.
   - Toggle Dark and navigate to `pages/about.html`, `pages/method.html`, `pages/disclaimer.html`, `pages/credits.html`, `howto/`, `howto/en/` to confirm theme persists.
   - Hard reload any page to confirm theme persists.
   - Verify desktop 2-column scroll reaches footer and mobile (360px) scroll works.

7. **Rollback Plan**
   - Revert the commit to restore previous layout/theme behavior.
