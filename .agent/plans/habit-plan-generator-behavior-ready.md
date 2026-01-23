1. **Goal**
   - Convert the habit plan generator output into a behavior-ready plan with actionable structure (goal, minimum action, trigger, recovery, weekly schedule, tracking checklist) and add required inputs/presets.

2. **Scope**
   - targets:
     - `tools/habit-plan-generator/index.html`
     - `tools/habit-plan-generator/app.js`
     - `tools/habit-plan-generator/style.css`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - Do not modify files outside scope.
   - Do not modify `common-spec/spec-ja.md`.
   - Do not add new external dependencies.

4. **Change List**
   - `index.html`: add new input fields (available time, preferred days, obstacles, motivation type) and preset buttons; update output containers to fixed structure; add copy/download actions and checklist toggle UI.
   - `app.js`: add preset data, generate behavior-ready plan sections, create 7-day table + checklist for 7/14/30 days, implement copy/download actions.
   - `style.css`: style new input fields, preset buttons, output sections, tables, and checklist toggle.

5. **Step-by-step Procedure**
   1. Inspect current HTML/JS/CSS.
   2. Update HTML structure for inputs, preset controls, and output sections.
   3. Update JS to generate structured plan and actions (copy/download, checklist toggle).
   4. Adjust CSS for layout and table/readability.
   5. Manually verify in browser.

6. **Test Plan**
   - Open `tools/habit-plan-generator/index.html` in a browser and:
     - Generate plan via presets and custom inputs.
     - Confirm output sections match required structure.
     - Confirm weekly schedule table and checklist toggle (7/14/30) update.
     - Confirm copy plan, copy checklist, and download .txt work.

7. **Rollback Plan**
   - `git checkout -- tools/habit-plan-generator/index.html tools/habit-plan-generator/app.js tools/habit-plan-generator/style.css`
