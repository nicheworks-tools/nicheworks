1. **Goal**
   - Restore FileType Sniffer core logic with magic-number detection, mismatch warnings, and JSON copy output for `tools/filetype-sniffer`.

2. **Scope**
   - targets: `tools/filetype-sniffer/index.html`, `tools/filetype-sniffer/en/index.html`, `tools/filetype-sniffer/style.css`, `tools/filetype-sniffer/app.js`
   - excluded: everything else

3. **Rules / Prohibitions**
   - No cross-tool navigation changes.
   - Do not edit files outside the listed scope.
   - Do not modify `common-spec/spec-ja.md`.
   - Preserve existing JA/EN language structure.
   - No new external dependencies.

4. **Change List**
   - Update HTML result area to include summary card, JSON panel, copy buttons, reset button, and safety note (JA/EN).
   - Update CSS for new result layout, warning styling, and code block formatting.
   - Create `app.js` to read files as ArrayBuffer, detect magic numbers (PDF/PNG/JPEG/GIF/WEBP/ZIP/MP3/MP4/WAV/EXE/ELF/RAR), report evidence, and handle mismatch warnings and copy actions.

5. **Step-by-step Procedure**
   1) Edit `index.html` and `en/index.html` to add result structure and safety note.
   2) Create `app.js` with detection and UI update logic.
   3) Update `style.css` to style summary, warnings, and JSON panel.

6. **Test Plan**
   - Open `tools/filetype-sniffer/index.html` and `tools/filetype-sniffer/en/index.html` in a browser.
   - Verify drag/drop and file selection both trigger analysis and update UI.
   - Confirm mismatch warning appears when extension differs.
   - Confirm Copy Summary/Copy JSON buttons work.

7. **Rollback Plan**
   - `git checkout -- tools/filetype-sniffer/index.html tools/filetype-sniffer/en/index.html tools/filetype-sniffer/style.css tools/filetype-sniffer/app.js`
