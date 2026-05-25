1. **Goal**
   - Deliver a deterministic command safety checker that reports risk level, findings, and safer steps for `tools/command-safety-checker`, updating UI wiring and guidance pages.

2. **Scope**
   - targets:
     - `tools/command-safety-checker/index.html`
     - `tools/command-safety-checker/app.js`
     - `tools/command-safety-checker/style.css`
     - `tools/command-safety-checker/howto/index.html`
     - `tools/command-safety-checker/howto/en/index.html`
     - `tools/command-safety-checker/qa.json`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation in headers; only footer links allowed per existing spec.
   - Do not move or rename files/folders.
   - No new external dependencies.
   - Keep scope strictly within the target tool.
   - Respect JA/EN language support (maintain existing bilingual setup).

4. **Change List**
   - `index.html`: align required DOM ids, add preset buttons, and restructure result sections for risk level, findings, safer steps, and normalized command output.
   - `app.js`: replace analyzer with deterministic rule library, render required outputs, provide safer steps, copy/clear actions, and presets.
   - `style.css`: adjust styles for new output blocks and responsive layout while preserving existing design.
   - `howto/index.html` + `howto/en/index.html`: update usage and limitations to match deterministic checker behavior and safer steps guidance.
   - `qa.json`: add automation steps for a high-risk curl|sh case.

5. **Step-by-step Procedure**
   1) Update `index.html` structure and ids.
   2) Implement deterministic analysis and rendering in `app.js`.
   3) Tweak styles for new sections in `style.css`.
   4) Update JA/EN howto pages with usage/limitations.
   5) Add `qa.json` with required checks.

6. **Test Plan**
   - Open the tool page, paste the sample command, and confirm risk level is HIGH with findings and safer steps.
   - Verify preset buttons populate the input.
   - Verify language toggle still works for static text.
   - Check mobile layout to ensure buttons stack and lists are readable.

7. **Rollback Plan**
   - `git checkout -- tools/command-safety-checker/index.html tools/command-safety-checker/app.js tools/command-safety-checker/style.css tools/command-safety-checker/howto/index.html tools/command-safety-checker/howto/en/index.html tools/command-safety-checker/qa.json`
