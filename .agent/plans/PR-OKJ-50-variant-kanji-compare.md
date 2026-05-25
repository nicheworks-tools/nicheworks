# ExecPlan: PR-OKJ-50 Variant Kanji Compare

## Scope
- Target only `tools/variant-kanji-compare/`.
- Read-only reference from `tools/old-kanji-reference/` for data file loading and existing token/meta patterns.
- No edits outside target tool folder.

## Files to touch
- `tools/variant-kanji-compare/index.html`
- `tools/variant-kanji-compare/style.css`
- `tools/variant-kanji-compare/app.js`
- (optional) `tools/variant-kanji-compare/README.md` (not required)

## High-level steps
1. Inspect nearby NicheWorks tool HTML for analytics/ad/cloudflare token values and page shell conventions.
2. Implement bilingual static page shell with required sections, links, and placeholders.
3. Implement app logic:
   - Safe JSON loading with optional-file fail-safe fallback.
   - Input parsing, comparison data extraction, mappings, notes, and summary.
   - JP/EN language switching.
   - Copy utilities with clipboard fallback and CSV output.
4. Implement responsive styling for 360px-safe layout.
5. Run required validation commands.
6. Prepare commit and PR body with manual verification checklist.

## Manual verification steps
1. Open `/tools/variant-kanji-compare/`.
2. Run each preset and verify Unicode/HTML/UTF-16 output and warning behavior.
3. Verify `吉 / 𠮷` shows supplementary plane and surrogate pair handling.
4. Verify `國 国` shows old→modern and modern→old candidates.
5. Verify copy buttons (field copy + CSV copy).
6. Switch EN mode and confirm English-only labels.
7. Verify mobile 360px layout has no horizontal overflow and stacks cards.
