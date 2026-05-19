# ExecPlan PR-OKJ-33A

## Scope
- Target only `tools/old-kanji-reference/`.
- No edits to SEO audit, sitemap, tools-index/meta, GA/Adsense/CF analytics/footer/donation/canonical.

## Files to touch
- `tools/old-kanji-reference/index.html`
- `tools/old-kanji-reference/app-meaning-v4.js`

## Steps
1. Inspect current language switch/render flow and card-clean dependency.
2. Remove `card-clean.js` loading and bump `app-meaning-v4.js` cache key.
3. Refactor `app-meaning-v4.js` so `currentLang` is the single language state for static + dynamic UI.
4. Ensure dict/meta loading supports required/optional behavior and includes `meta-extra-4.json` fallback.
5. Update list card rendering to user-facing content only; keep detail panel/detector/filter/status bilingual and fully synchronized.
6. Run required validation commands.
7. Commit and prepare PR message.

## Manual verification
- JP initial: header/search/detector/filters/cards/copy all JP.
- Switch EN: all above become EN with no JP remnants.
- Switch back JP: all JP again with no EN remnants.
- Validate search terms: 舊, 旧, 邊, 辺, 齋, 斎, 﨑, U+570B.
- Confirm no `card-clean.js` loaded.
