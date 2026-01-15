1. **Goal**
   - Overhaul mobile-first (360px) UX for `tools/construction-tools-atlas/` with compact result cards, full-screen detail sheet, collapsible sticky search, and empty state guidance.

2. **Scope**
   - targets: `tools/construction-tools-atlas/**`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - No out-of-scope edits.
   - Do not modify `common-spec/spec-ja.md` or other specs.
   - No new external dependencies or frameworks.

4. **Change List**
   - Update layout styles for mobile-first card compactness and sticky/collapsible search.
   - Add full-screen detail sheet/modal optimized for thumb interaction.
   - Add empty state and first-time guide with example queries.
   - Preserve existing language handling and assets usage.

5. **Step-by-step Procedure**
   1. Inspect current HTML/CSS/JS for the tool.
   2. Adjust HTML structure for compact cards, detail sheet, and empty state.
   3. Update CSS for 360px-first layout (no horizontal scroll) and sticky search.
   4. Update JS to handle collapsible search, detail open/close/back, and empty state.
   5. Verify behavior on mobile viewport and basic desktop.

6. **Test Plan**
   - Open the tool page at 360px width and verify:
     - search -> results -> open detail -> close/back flow is smooth,
     - no horizontal scroll,
     - empty state explains usage with example queries.

7. **Rollback Plan**
   - Revert the commit via `git revert <commit>` or reset to previous HEAD.
