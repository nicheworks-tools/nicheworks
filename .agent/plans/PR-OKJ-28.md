# PR-OKJ-28: Old Kanji Reference v4 detail UX stabilization

## Scope
- `tools/old-kanji-reference/` only.
- Primary files expected to touch:
  - `tools/old-kanji-reference/app-meaning-v4.js`
  - `tools/old-kanji-reference/index.html`
  - `tools/old-kanji-reference/search-hint-compat.js` only if removal is confirmed safe.

## Goals
1. Move reading of `data-search-hint-ja` / `data-search-hint-en` into `app-meaning-v4.js`.
2. Remove dependency on `search-hint-compat.js` and delete it if no longer needed.
3. Clean up script loading in `index.html`.
4. Preserve detail panel, mobile detail toggle, reverse lookup, Unicode display, copy behavior, and JP/EN switch.
5. Pass syntax check for `app-meaning-v4.js`.
6. Run metadata validation with no fatal errors.

## Steps
1. Inspect current HTML and v4 app script loading/search hint behavior.
2. Implement native search hint dataset support in `app-meaning-v4.js` without changing dictionary/meta data.
3. Remove `search-hint-compat.js` script loading and delete file if unused.
4. Run `node --check tools/old-kanji-reference/app-meaning-v4.js`.
5. Run `node tools/old-kanji-reference/validate-meta.js`.
6. Smoke-check references for the requested confirmation characters in existing data paths if practical.

## Manual verification for user
- Open `/tools/old-kanji-reference/`.
- Check JP/EN language switch updates the search hint.
- Search/check: `國`, `国`, `邊`, `辺`, `齋`, `斎`, `雜`, `雑`, `U+570B`.
- Confirm detail panel and mobile detail toggle open/close normally.
- Confirm reverse lookup, Unicode display, and copy buttons still work.
