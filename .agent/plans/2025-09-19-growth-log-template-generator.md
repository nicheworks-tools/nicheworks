1. **Goal**
   - Add preset modes, deterministic next-action suggestions, and example injection to the growth log template generator.
   - No common-spec updates required beyond existing tool layout.

2. **Scope**
   - targets:
     - tools/growth-log-template-generator/index.html
     - tools/growth-log-template-generator/app.js
     - tools/growth-log-template-generator/style.css
     - tools/growth-log-template-generator/howto/index.html (optional)
     - tools/growth-log-template-generator/howto/en/index.html (optional)
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation additions.
   - No edits outside the listed scope.
   - Do not modify common-spec files.
   - Do not add external dependencies.
   - Preserve existing language behavior unless explicitly changed.

4. **Change List**
   - index.html: add preset selector, example buttons, and next-actions output area labels.
   - app.js: implement preset-driven required fields/output headings; deterministic next-action rules; example input injection; example-only log generation; copy + download .md/.txt updates.
   - style.css: style new controls/sections.
   - howto pages (optional): mention presets, example buttons, next-action behavior.

5. **Step-by-step Procedure**
   1) Inspect current tool HTML/JS/CSS to understand structure.
   2) Update HTML to add preset selector and example buttons.
   3) Update JS to apply preset configurations, generate outputs, and add deterministic next-action logic.
   4) Update CSS for layout/visual consistency.
   5) Update howto pages if present/needed.

6. **Test Plan**
   - Open the tool in a browser and verify:
     - Preset selector changes required fields/output headings.
     - Example injection fills inputs and generates example-only output.
     - Next actions appear based on metrics and include “If you do only 1 thing”.
     - Copy/download still works for .md and .txt.

7. **Rollback Plan**
   - Revert the commit to restore previous tool behavior.
