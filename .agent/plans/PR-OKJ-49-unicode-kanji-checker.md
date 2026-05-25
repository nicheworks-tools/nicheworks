# ExecPlan: PR-OKJ-49 Unicode Kanji Checker

## Scope
- Target only: `tools/unicode-kanji-checker/`
- Read-only reuse from: `tools/old-kanji-reference/`

## Files to touch
- `tools/unicode-kanji-checker/index.html`
- `tools/unicode-kanji-checker/app.js`
- `tools/unicode-kanji-checker/style.css`
- (optional) `tools/unicode-kanji-checker/README.md`

## Steps
1. Inspect existing NicheWorks tool shell and old-kanji data formats/tokens.
2. Implement static page shell with JP/EN UI, analytics/ad/cloudflare snippets reusing existing values.
3. Implement browser-side analyzer and safe data loading with optional-file fail-safe behavior.
4. Implement summary/cards/copy/CSV/caution/links and language switch with no mixed-language labels.
5. Add responsive styles for 360px and card/code wrapping.
6. Run required validations and confirm only allowed files changed.

## Manual verification
1. Open `/tools/unicode-kanji-checker/`.
2. Input `國` and verify U+570B, HTML entities literal text, mapping `國 → 国`, copy works.
3. Input `﨑` and verify compatibility warning.
4. Input `𠮷` and verify supplementary-plane warning and surrogate UTF-16.
5. Input `国` and verify old/variant candidate (e.g. `國`) appears if dict contains it.
6. Input `國﨑邊` and verify summary and unique cards update.
7. Switch to EN and verify English-only labels while results persist.
8. Verify Unicode/HTML hex/CSV copy actions.
9. Verify mobile 360px has no horizontal overflow and readable wrapped code/actions.
