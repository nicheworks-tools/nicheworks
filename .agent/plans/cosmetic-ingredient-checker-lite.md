1. **Goal**
   - Implement deterministic INCI parsing and flagging for `tools/cosmetic-ingredient-checker-lite/` with summary counts, disclaimers, and how-to updates per task requirements.

2. **Scope**
   - targets:
     - `tools/cosmetic-ingredient-checker-lite/index.html`
     - `tools/cosmetic-ingredient-checker-lite/app.js`
     - `tools/cosmetic-ingredient-checker-lite/style.css`
     - `tools/cosmetic-ingredient-checker-lite/howto/index.html`
     - `tools/cosmetic-ingredient-checker-lite/howto/en/index.html`
     - `tools/cosmetic-ingredient-checker-lite/qa.json`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - Do not touch out-of-scope files or folders.
   - Do not modify `common-spec/spec-ja.md`.
   - No new external dependencies.

4. **Change List**
   - `index.html`: Ensure required UI IDs exist (#inciInput, #checkBtn, #clearBtn, #copyBtn, #parsedCount, #itemsTable/#itemsList, #summaryBox, #disclaimerBox) and wire to script/style.
   - `app.js`: Implement deterministic parser, normalization, dictionaries, flags, summary counts, and output rendering with cautious language and no network calls.
   - `style.css`: Add mobile-friendly layout, chips, table/list styling, and prominent disclaimer styling.
   - `howto/index.html` + `howto/en/index.html`: Update usage steps, limitations, and “not medical advice” disclaimer.
   - `qa.json`: Add automation steps per task instructions.

5. **Step-by-step Procedure**
   1. Review existing tool files for current structure and IDs.
   2. Update HTML to include required elements and placeholders.
   3. Implement parser/flags/renderer in `app.js`.
   4. Update styles for responsive layout and readability.
   5. Update how-to pages with usage/limitations.
   6. Add `qa.json` test script.

6. **Test Plan**
   - Open the tool page locally and paste sample INCI list; confirm parsed count, item flags, summary box, and disclaimer are visible.
   - Verify copy/clear/check buttons work and no console errors.
   - Review mobile layout via responsive viewport.

7. **Rollback Plan**
   - `git checkout -- tools/cosmetic-ingredient-checker-lite` to revert all changes.
