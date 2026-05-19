# ExecPlan PR-OKJ-44

## Scope
- tools/old-kanji-reference/compatibility-notes.json (new)
- tools/old-kanji-reference/app-meaning-v4.js
- tools/old-kanji-reference/style.css
- tools/old-kanji-reference/validate-compatibility-notes.js (new)

## Steps
1. Inspect current old-kanji-reference data/model and pick 20+ valid entries from dict.json.
2. Add compatibility-notes.json with required schema and practical JA/EN notes.
3. Update app-meaning-v4.js to load compatibility notes safely, add automatic technical detection, and render detail-panel-only compatibility section with JP/EN labels and fallback notes.
4. Add minimal CSS for compatibility note section and mobile wrapping.
5. Add validate-compatibility-notes.js and run requested validations.
6. Verify only target files changed, then commit and prepare PR message.

## Manual verification for reviewer
- Open old-kanji-reference and select entries such as 﨑/崎, 髙/高, 𠮷/吉.
- Confirm compatibility section appears only in detail panel, not list cards.
- Toggle JP/EN and confirm labels/notes switch language.
- Confirm existing Unicode/HTML copy buttons still available.
- Temporarily block compatibility-notes.json loading in devtools and confirm fallback notes still appear for auto-detected risks.
