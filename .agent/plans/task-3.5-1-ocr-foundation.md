1. **Goal**
   - Implement OCR beta foundation (lazy load, progress UI, cancel, sequential multi-image processing) for `tools/sukima-baito-income`, following the task requirements (no OCR parsing/preview yet).

2. **Scope**
   - targets: `tools/sukima-baito-income/app.js`
   - excluded: all other files and directories

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - Do not edit out-of-scope files.
   - Do not modify `common-spec/spec-ja.md`.
   - Keep existing tool behavior (manual input, CSV, theme/font) intact.

4. **Change List**
   - `tools/sukima-baito-income/app.js`
     - Adjust OCR progress modal IDs and text per task requirements.
     - Implement OCR lazy load, progress updates, cancel handling, and sequential multi-image processing.
     - Collect recognized text into `ocrTexts` and show completion toast/placeholder handoff (no preview UI or parsing usage).

5. **Step-by-step Procedure**
   1. Review current OCR wiring and modal injection in `app.js`.
   2. Update progress modal markup/IDs and `setOCRProgress` logic.
   3. Adjust `runOCR` to gather recognized text per image, handle cancel, and show completion toast.
   4. Ensure `ocrInput` value reset and sequential processing remain intact.

6. **Test Plan**
   - Manual: open tool UI, click OCR button, select images, observe progress text updates and cancel behavior.
   - Confirm existing features (manual entry, CSV import/export, theme/font toggles) still work.

7. **Rollback Plan**
   - Revert `tools/sukima-baito-income/app.js` to the previous commit.
