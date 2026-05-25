1. **Goal**
   - Implement OCR text parsing to produce `OcrCandidate[]` for Timee list/detail screenshots in `tools/sukima-baito-income/app.js`, following Task 3.5-2 requirements.

2. **Scope**
   - targets: `tools/sukima-baito-income/app.js`
   - excluded: all other files

3. **Rules / Prohibitions**
   - No cross-tool navigation additions.
   - No out-of-scope edits outside `tools/sukima-baito-income/app.js`.
   - Do not modify `common-spec/spec-ja.md` or other specs.
   - Do not add new external dependencies.

4. **Change List**
   - Add OCR parsing helpers to extract dates, amounts, and workplace candidates.
   - Implement list/detail auto-detection and candidate generation with skip reasons.
   - Add `parseOcrTexts()` entry point and placeholder `openOcrPreview()` wiring (log/toast only).

5. **Step-by-step Procedure**
   1. Inspect existing OCR flow in `app.js` (Task 3.5-1 output).
   2. Add parsing utilities and list/detail detection.
   3. Generate `OcrCandidate[]` with required schema and skip handling.
   4. Wire `parseOcrTexts()` after OCR completion to prepare preview.

6. **Test Plan**
   - No automated tests; manually run the app and confirm OCR candidates are logged and toast shows count.

7. **Rollback Plan**
   - Revert changes in `tools/sukima-baito-income/app.js`.
