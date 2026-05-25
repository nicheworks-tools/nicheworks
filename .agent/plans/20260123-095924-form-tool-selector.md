1. **Goal**
   - Add auditable recommendation details (matched/not matched/best for) and decision memo output for tools/form-tool-selector, aligned with existing tool behavior.

2. **Scope**
   - targets:
     - tools/form-tool-selector/index.html
     - tools/form-tool-selector/app.js
     - tools/form-tool-selector/style.css
     - tools/form-tool-selector/howto/index.html (optional)
     - tools/form-tool-selector/howto/en/index.html (optional)
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - No out-of-scope edits.
   - Do not modify common-spec files.
   - Preserve language support rules already present in this tool.
   - Do not add new external dependencies.

4. **Change List**
   - index.html: add UI blocks for recommendation details, decision memo, copy buttons, collapsible question groups, and a quick start sample button.
   - app.js: compute matched/not matched/best-for per recommendation, generate decision memo text, copy handlers, quick start autofill, and collapse/expand logic.
   - style.css: add styles for new blocks, details lists, memo box, copy buttons, and collapsible group UI.
   - howto pages (if needed): mention new memo/copy and quick start features.

5. **Step-by-step Procedure**
   1) Inspect current HTML/JS/CSS for form-tool-selector.
   2) Update HTML structure for results details, memo block, copy buttons, collapsible groups, and quick start button.
   3) Update JS to compute match/ tradeoff lists and memo text, and wire copy + quick start + collapsible behavior.
   4) Update CSS for new components and collapse affordances.
   5) Validate in browser by running locally and checking outputs for sample inputs.

6. **Test Plan**
   - Open tools/form-tool-selector/index.html in browser and run a few scenarios.
   - Confirm Top 3 show matched requirements, tradeoffs, best-for.
   - Confirm decision memo and copy buttons work.
   - Verify collapsible groups expand/collapse and quick start fills inputs.

7. **Rollback Plan**
   - Revert the modified files using git checkout if regressions are found.
