# ExecPlan OKJ-M05
- Scope: tools/old-kanji-ocr-scanner/* only
- Files: index.html, app.js, style.css
- Steps:
  1) Inspect current OCR placeholder UI and i18n wiring
  2) Implement browser-side single-image OCR flow with status/progress/error handling
  3) Connect editable OCR result textarea, copy action, and related-link query updates
  4) Update privacy/accuracy/OCR notes and responsive styles
  5) Run syntax validation and git diff review
- Manual verification:
  - Select one image, run OCR, edit result, verify related links, copy result, remove image, switch JA/EN, and test 360px layout.
