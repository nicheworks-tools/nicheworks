1. **Goal**
   - Improve kanji-modernizer reliability and transparency (dict load resilience, replacement visibility, safe exclusions, policy text) in `tools/kanji-modernizer`.
   - No common spec changes required for this task.

2. **Scope**
   - targets: `tools/kanji-modernizer/index.html`, `tools/kanji-modernizer/app.js`, `tools/kanji-modernizer/style.css`
   - verify-only: `tools/kanji-modernizer/dict.json`
   - optional: `tools/kanji-modernizer/howto/index.html`, `tools/kanji-modernizer/howto/en/index.html`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation or header nav additions.
   - Do not touch files outside `tools/kanji-modernizer/**`.
   - Do not modify `common-spec/spec-ja.md` or other specs.
   - No new external dependencies.

4. **Change List**
   - `index.html`: add policy block, exclusion checkbox, error/retry UI, replacement list table, copy buttons.
   - `app.js`: handle dict load failure (disable convert, show error with retry, caching note), implement exclusion rules (URLs/code fences/ASCII segments), generate replacement list with counts, add copy handlers.
   - `style.css`: style new UI blocks (error, policy, table, buttons).
   - `dict.json`: verify no edits.
   - optional howto pages: update text to mention exclusions and replacement list if needed.

5. **Step-by-step Procedure**
   1. Inspect existing kanji-modernizer HTML/JS/CSS to understand current UI and conversion flow.
   2. Update HTML to add new controls and output sections while keeping existing structure.
   3. Update JS to load dict with error handling + retry, apply exclusion logic, track replacements, and support copy actions.
   4. Update CSS for layout of new sections.
   5. Verify dict.json untouched.

6. **Test Plan**
   - Manual: open tool page, attempt conversion with dict loaded, confirm replacement list and copy buttons.
   - Manual: simulate dict load failure (e.g., temporary bad URL) and confirm error + retry and disabled convert button.
   - Manual: check exclusion checkbox prevents conversion inside URLs/code fences/ASCII segments.

7. **Rollback Plan**
   - Revert changes to modified files via `git checkout -- <files>`.
