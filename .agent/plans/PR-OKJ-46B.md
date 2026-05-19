# ExecPlan: PR-OKJ-46B Name Old Kanji Checker quality fixes

## Scope
- `tools/name-old-kanji-checker/` only.

## Files to touch
- `tools/name-old-kanji-checker/index.html`
- `tools/name-old-kanji-checker/app.js`
- `tools/name-old-kanji-checker/style.css`

## Steps
1. Inspect current implementation and nearby NicheWorks tool shell conventions.
2. Refactor `app.js` into readable modules/functions while preserving browser-only behavior.
3. Fix metadata loading (`entries` object), build `modernToOld` reverse index from `dict.old_to_new`, and improve compatibility/category handling.
4. Add robust loading/partial-failure/error messaging and keep privacy note bilingual.
5. Align `index.html` and `style.css` with common shell basics and related links constraints.
6. Run required validations:
   - `node --check tools/name-old-kanji-checker/app.js`
   - `node tools/old-kanji-reference/validate-meta.js`
   - `node tools/old-kanji-reference/validate-compatibility-notes.js`
7. Commit changes and prepare PR message with manual verification checklist.

## Manual verification notes
1. Enter `齋藤` and confirm `齋 → 斎` appears with metadata/link if available.
2. Enter `渡邊` and confirm old→modern mapping shows (`邊/邉` style entries depending on input).
3. Enter `斎` and confirm reverse candidates include `齋 / 齊` if present.
4. Enter `﨑` and confirm compatibility/rendering warning appears.
5. Switch to EN and confirm labels render in English.
6. Simulate optional metadata fetch failure and confirm dict-only fallback still works.
