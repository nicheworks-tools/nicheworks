1. **Goal**
   - Complete the analytics-privacy-kit tool as a privacy copy generator per task requirements (inputs, deterministic templates, outputs, copy/download, no network calls), including JA/EN how-to pages.

2. **Scope**
   - targets:
     - tools/analytics-privacy-kit/index.html
     - tools/analytics-privacy-kit/app.js
     - tools/analytics-privacy-kit/style.css
     - tools/analytics-privacy-kit/howto/index.html
     - tools/analytics-privacy-kit/howto/en/index.html
     - tools/analytics-privacy-kit/qa.json
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation.
   - Do not modify folders/files outside scope.
   - Do not change common-spec files.
   - No new external dependencies.
   - Keep tool bilingual (JA/EN) as default.

4. **Change List**
   - index.html: build required form inputs, provider checkboxes, language select, output sections with copy buttons; add privacy note; wire buttons and output areas.
   - app.js: implement deterministic template generator, copy/download/clear actions, language switching, and no network calls.
   - style.css: add responsive layout and UI styles for inputs/outputs/tabs/sections.
   - howto/index.html + howto/en/index.html: add 30-sec usage, when to edit, disclaimer in JA/EN.
   - qa.json: add scripted steps per requirements.

5. **Step-by-step Procedure**
   1) Review existing analytics-privacy-kit files.
   2) Update HTML structure and required IDs.
   3) Implement generator logic in app.js.
   4) Add CSS for layout and mobile responsiveness.
   5) Create how-to pages and qa.json.
   6) Verify no console errors and all actions work locally.

6. **Test Plan**
   - Open tools/analytics-privacy-kit/index.html in browser.
   - Generate outputs with default settings (JA) and with EN.
   - Verify copy buttons and download output.
   - Confirm responsive layout by narrowing window.

7. **Rollback Plan**
   - Revert the commit to restore previous tool state.
