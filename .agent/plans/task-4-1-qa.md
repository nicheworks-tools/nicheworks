1. **Goal**
   - Add lightweight guardrails and clearer messaging in `tools/sukima-baito-income/app.js` to reduce crashes and make QA flows (add/edit/delete/import/OCR) safer, without changing core behavior.

2. **Scope**
   - targets:
     - `tools/sukima-baito-income/app.js`
     - `docs/qa-sukima-baito-income.md`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - No out-of-scope edits.
   - Do not modify `common-spec/spec-ja.md` or `spec-en.md`.
   - No new external dependencies.
   - Preserve existing language behavior.

4. **Change List**
   - `tools/sukima-baito-income/app.js`
     - Add defensive checks for editing indices and empty list actions.
     - Ensure delete/edit operations adjust editing index safely.
     - Improve error messages for CSV/OCR edge cases (empty/duplicate/invalid selections).
   - `docs/qa-sukima-baito-income.md`
     - Add a short manual QA checklist covering the acceptance criteria flows.

5. **Step-by-step Procedure**
   1. Review current add/edit/delete/import/OCR flow in `app.js`.
   2. Implement guard clauses and index adjustments for edit/delete operations.
   3. Add clearer error messages for empty or invalid selections during import/OCR.
   4. Add a QA checklist in docs.
   5. Run formatting/quick sanity checks if applicable.

6. **Test Plan**
   - Manual smoke in browser:
     - Add/edit/delete a record and confirm summaries update.
     - Export CSV, re-import, and confirm duplicates are skipped.
     - OCR flow: preview, add, ensure duplicates rejected.

7. **Rollback Plan**
   - `git revert <commit>` to undo the changes.
