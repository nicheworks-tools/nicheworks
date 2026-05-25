1. **Goal**
   - Add a consistent light/dark theme system for Construction Tools & Slang Atlas pages using a `data-theme` attribute, without persistence.

2. **Scope**
   - targets:
     - tools/construction-tools-atlas/index.html
     - tools/construction-tools-atlas/style.css
     - tools/construction-tools-atlas/pages/about.html
     - tools/construction-tools-atlas/pages/method.html
     - tools/construction-tools-atlas/pages/disclaimer.html
     - tools/construction-tools-atlas/pages/credits.html
     - tools/construction-tools-atlas/howto/index.html
     - tools/construction-tools-atlas/howto/en/index.html
     - tools/construction-tools-atlas/app.js
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation additions.
   - Do not edit outside the scoped files.
   - Do not add dependencies or change common specs.
   - Keep language support intact.

4. **Change List**
   - index.html: add theme toggle button in header and set initial `data-theme` attribute.
   - style.css: define light/dark theme variables and replace hard-coded colors with variables, including overlays and debug UI tokens.
   - app.js: add theme state, apply theme from URL, update toggle UI, and propagate theme param to internal links.
   - pages/*.html + howto pages: set `data-theme` attribute and add small script to apply `theme` query param to `data-theme` + update internal links; update inline styles in howto pages to use theme variables instead of hard-coded colors.

5. **Step-by-step Procedure**
   1. Update index.html to include the theme toggle button and default theme attribute.
   2. Update style.css with theme token definitions and variable-based colors.
   3. Update app.js to read/apply theme, handle the toggle, and update internal links.
   4. Update static pages to apply theme from query param and make howto styles theme-aware.
   5. Review for 360px header layout and no horizontal scroll.

6. **Test Plan**
   - Manually open index.html, toggle light/dark, and confirm colors apply.
   - Open static pages with `?theme=light` and `?theme=dark` to confirm styles and links preserve theme.
   - Resize viewport to 360px and confirm header layout and no horizontal scroll.

7. **Rollback Plan**
   - `git restore tools/construction-tools-atlas/index.html tools/construction-tools-atlas/style.css tools/construction-tools-atlas/app.js tools/construction-tools-atlas/pages/*.html tools/construction-tools-atlas/howto/index.html tools/construction-tools-atlas/howto/en/index.html`
