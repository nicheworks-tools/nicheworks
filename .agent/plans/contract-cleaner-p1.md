1. **Goal**
   - Improve `tools/contract-cleaner` to a finished P1 state with deterministic risk highlighting, category grouping, copyable summaries/questions, and updated howto pages, following the repo’s tool layout and language rules.

2. **Scope**
   - targets: `tools/contract-cleaner/index.html`, `tools/contract-cleaner/app.js`, `tools/contract-cleaner/style.css`, `tools/contract-cleaner/howto/index.html`, `tools/contract-cleaner/howto/en/index.html`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation beyond the small footer-near links block already allowed.
   - No edits outside `tools/contract-cleaner/**`.
   - Do not modify `common-spec/spec-ja.md` or other specs.
   - Keep JA/EN support and do not remove the language toggle.
   - No new external dependencies or network calls.

4. **Change List**
   - `index.html`: update DOM structure to required IDs (contractText, analyzeBtn, etc.), add local-only notice, counters, category list, highlight preview with `<mark>` support, copy/download/example/filters, and toast; load `app.js` as module.
   - `app.js`: replace rules loading with in-file dictionary; implement matching, grouping, highlight rendering with 200-cap; add summary/questions copy logic and download; update i18n and handle language fallback safely; remove/guard any missing DOM references.
   - `style.css`: style new controls, counters, category cards/details, mark highlights, toast, and ensure mobile-friendly layout.
   - `howto/index.html` + `howto/en/index.html`: refresh to short “30-second” usage, capabilities/limits, privacy note, and example flagged terms.

5. **Step-by-step Procedure**
   1. Update `index.html` to required inputs/outputs and new action buttons.
   2. Implement new deterministic dictionary and matching logic in `app.js` with i18n-safe labels.
   3. Update `style.css` to support new layout, highlights, and responsive behavior.
   4. Revise JA/EN howto pages to match tool behavior and keep them concise.
   5. Sanity-check for missing IDs and console errors.

6. **Test Plan**
   - Open `tools/contract-cleaner/index.html` in a browser.
   - Paste a sample containing: “損害賠償, 免責, 解除, 違約金, 知的財産, 秘密保持, 準拠法, 管轄”.
   - Confirm total/categorical counts, per-category snippets, highlight preview, and copy buttons/ toast.
   - Toggle “Show only matched categories” and verify filtering.
   - Verify no console errors and layout on narrow (≈360px) and desktop widths.
   - Check JA/EN language toggle and howto pages (JA/EN).

7. **Rollback Plan**
   - `git restore tools/contract-cleaner/index.html tools/contract-cleaner/app.js tools/contract-cleaner/style.css tools/contract-cleaner/howto/index.html tools/contract-cleaner/howto/en/index.html`
