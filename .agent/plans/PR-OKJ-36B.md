# ExecPlan: PR-OKJ-36B

## Scope
- `tools/old-kanji-reference/app-meaning-v4.js`
- `tools/old-kanji-reference/verified-badge.js`
- `tools/old-kanji-reference/entity-detail-hotfix.js` (delete if unused)

## Steps
1. Inspect current detail panel rendering/copy path and verified badge hotfix coupling.
2. Refactor `renderDetailPanel(entry)` so HTML entity display/copy is built via DOM APIs with `textContent` and `dataset` property assignment; preserve Unicode behavior.
3. Ensure `switchLang(currentLang);` is called at end of detail rendering.
4. Remove temporary entity-detail hotfix logic from `verified-badge.js`, keeping unrelated behaviors.
5. Delete `entity-detail-hotfix.js` if not loaded.
6. Run required validation commands.

## Manual verification
1. Open Old Kanji Reference.
2. Search `國`, open detail panel.
3. Confirm entity section displays literal `&#x570B;` and `&#x56FD;`.
4. Confirm HTML copy buttons copy literal entity strings.
5. Search `﨑`, open detail panel, confirm compatibility/environment note remains.
6. Switch EN then JP, confirm detail labels are single-language only.
