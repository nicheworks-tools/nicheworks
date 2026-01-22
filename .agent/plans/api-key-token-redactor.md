1. **Goal**
   - Restore and complete the `tools/api-key-token-redactor/` tool as a working, offline redaction UI that replaces secrets with placeholders and provides counts per type.

2. **Scope**
   - targets:
     - `tools/api-key-token-redactor/index.html`
     - `tools/api-key-token-redactor/app.js`
     - `tools/api-key-token-redactor/style.css`
     - `tools/api-key-token-redactor/howto/index.html`
     - `tools/api-key-token-redactor/howto/en/index.html`
     - `tools/api-key-token-redactor/qa.json`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation (header-based or site-wide).
   - Do not edit out-of-scope files.
   - Do not modify `common-spec/spec-ja.md` or other specs.
   - No new external dependencies.
   - Keep tool fully offline (no network calls, no storage).

4. **Change List**
   - `index.html`: build the tool UI with required IDs (inputs, checkboxes, buttons, output, summary) and privacy notice.
   - `app.js`: implement deterministic redaction logic for required patterns, keep-length option, per-type counts, copy/download/clear behavior.
   - `style.css`: add responsive, mobile-friendly styling.
   - `howto/index.html` + `howto/en/index.html`: add concise usage, supported patterns, limitations, privacy note.
   - `qa.json`: add automated QA steps per task instructions.

5. **Step-by-step Procedure**
   1. Inspect existing files in `tools/api-key-token-redactor/`.
   2. Update HTML to include required elements/IDs and privacy text.
   3. Implement redaction logic and UI wiring in `app.js`.
   4. Add responsive styles in `style.css`.
   5. Write JA/EN how-to pages.
   6. Add `qa.json` with the specified checks.
   7. Verify locally by opening the tool and testing sample inputs.

6. **Test Plan**
   - Manual: open `tools/api-key-token-redactor/index.html` in browser; paste sample with sk- token, Bearer token, JWT; click Redact; verify output redacts and summary updates; test copy/download/clear.
   - Check mobile layout by resizing viewport.

7. **Rollback Plan**
   - `git checkout -- tools/api-key-token-redactor/` to revert all changes in scope.
