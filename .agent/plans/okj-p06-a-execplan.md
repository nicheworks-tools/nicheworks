# ExecPlan: OKJ-P06-A OCR history/collection data model scaffold

## Scope
- docs/old-kanji-toolkit/ocr-history-collection-data-model.md
- assets/okj-history-collection.js (optional pure helper scaffold)

## Files to touch
- Create `docs/old-kanji-toolkit/ocr-history-collection-data-model.md`
- Create `assets/okj-history-collection.js`

## Steps
1. Inspect current OKJ Pro adapter/runtime patterns and feature IDs for consistency.
2. Author data model document with required sections, explicit free/pro boundary, privacy, retention, adapter gating, and non-goals.
3. Add disabled-safe pure helper scaffold for record creation/normalization only (no storage/network/entitlement logic).
4. Run lightweight validation checks (search for forbidden patterns in helper, check required schemaVersion strings).
5. Commit changes and prepare PR message.

## Manual verification
1. Open `docs/old-kanji-toolkit/ocr-history-collection-data-model.md` and confirm all 15 required sections exist.
2. Confirm schemas include `okj-ocr-history-v1` and `okj-old-kanji-collection-v1`.
3. Open `assets/okj-history-collection.js` and verify only pure functions are exported under `window.OldKanjiHistoryCollection`.
4. Confirm helper has no `localStorage`, `fetch`, `Stripe`, `webhook`, `active: true`.
