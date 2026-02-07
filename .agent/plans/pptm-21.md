1. **Goal**
   - Fix the PDF Page Tools Mini startup error (state TDZ) and ensure tool CSS loads reliably on GitHub static hosting while preserving current UI/behavior.
   - No spec changes; adhere to existing tool layout and common spec usage as already implemented.

2. **Scope**
   - targets:
     - `tools/pdf-page-tools-mini/app.js`
     - `tools/pdf-page-tools-mini/index.html`
     - `tools/pdf-page-tools-mini/usage.html`
     - `tools/pdf-page-tools-mini/style.css`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation additions.
   - Do not rename/move files or folders.
   - Do not modify `common-spec/spec-ja.md` or other specs.
   - Preserve existing JA/EN behavior, ads, donation links, internal links, FAQ/FAQPage schema.
   - Do not introduce new external dependencies.

4. **Change List**
   - `app.js`: adjust state initialization order or guard `setBusy` to prevent TDZ error before state is initialized.
   - `index.html` / `usage.html`: ensure CSS link ordering (nw-base before tool style) and resolve GitHub Pages path issues for `style.css` without changing behavior.
   - `style.css`: align selectors with actual DOM if mismatches prevent styles from applying (minimal, no functional changes).

5. **Step-by-step Procedure**
   1) Inspect current HTML/CSS/JS for state initialization and stylesheet paths.
   2) Update JS to eliminate pre-initialization access to `state`.
   3) Update HTML link tags to ensure correct order and robust path for `style.css` on GitHub Pages.
   4) Adjust CSS selectors only if needed to match existing DOM.
   5) Recheck for unintended UI/behavior changes.

6. **Test Plan**
   - Run `python3 -m http.server 8080` and open:
     - `http://localhost:8080/tools/pdf-page-tools-mini/`
     - `http://localhost:8080/tools/pdf-page-tools-mini/usage.html`
   - Verify no console error about `state` and confirm styles match expected mobile layout (480px optimizations).

7. **Rollback Plan**
   - Revert the commit or restore the modified files from `git checkout -- <files>`.
