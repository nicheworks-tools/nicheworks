1. **Goal**
   - Add beginner-friendly OCR (β) usage documentation to `tools/sukima-baito-income/howto/index.html`, and ensure `index.html` links to usage per common spec if missing.

2. **Scope**
   - targets: `tools/sukima-baito-income/howto/index.html`, `tools/sukima-baito-income/index.html`
   - excluded: all other files

3. **Rules / Prohibitions**
   - No cross-tool navigation additions.
   - Do not modify `common-spec/spec-ja.md` or other specs.
   - Do not add new external dependencies.
   - Keep edits within declared scope only.

4. **Change List**
   - Add an OCR (β) section to usage content covering summary, list/detail use cases, step-by-step examples, duplicate rejection rules, limitations, and FAQ.
   - Add or verify usage page link from the main index following common spec.

5. **Step-by-step Procedure**
   1. Inspect existing `howto/index.html` and `index.html` structure and common spec cues.
   2. Draft concise OCR documentation blocks with headings and bullet lists for mobile readability.
   3. Add or update usage link on `index.html` if missing.
   4. Re-check for scope/spec compliance.

6. **Test Plan**
   - No automated tests; visual review in browser if needed.

7. **Rollback Plan**
   - Revert changes in `tools/sukima-baito-income/howto/index.html` and `tools/sukima-baito-income/index.html`.
