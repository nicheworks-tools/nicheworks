# ExecPlan: PR-OKJ-26 v4 stabilization and detail UX

## Scope
- Target: `tools/old-kanji-reference/`
- Workflow check file: `.github/workflows/old-kanji-reference-validate.yml` (read-only verification)

## Files to touch
- `tools/old-kanji-reference/app-meaning-v4.js`
- `tools/old-kanji-reference/verified-badge.css`
- `tools/old-kanji-reference/index.html`

## Steps
1. Inspect current v4 rendering/search/filter/reverse lookup implementation and CSS hooks.
2. Add detail panel + mobile collapsed detail behavior while preserving existing search/filter/copy behavior.
3. Improve reverse lookup exact-match logic using `entriesCache` and related old forms by modern text.
4. Improve filter labels/behavior alignment and Unicode display for multi-char modern values.
5. Add pair-only display note and verified/pair-only status output in cards/detail.
6. Update cache keys in `index.html`.
7. Run metadata validator and sanity-check file changes.

## Manual verification
- Search checks: `國`, `国`, `邊`, `辺`, `齋`, `斎`, `雜`, `雑`, `U+570B`.
- Verify reverse summary + detail panel open behavior + copy buttons.
- Verify JP/EN switch for filter labels/status/detail labels.
- At 360px width: no horizontal scroll, collapsed details toggle works.
