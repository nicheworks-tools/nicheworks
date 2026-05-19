# ExecPlan PR-OKJ-43

## Scope
- tools/old-kanji-reference/stroke-counts.json (new)
- tools/old-kanji-reference/app-meaning-v4.js
- tools/old-kanji-reference/style.css
- tools/old-kanji-reference/validate-stroke-counts.js (new)

## Steps
1. Inspect existing data loading/detail panel rendering and find integration points.
2. Add stroke-counts data file (35+ entries) matching dict mapping.
3. Update app-meaning-v4.js to load stroke-counts with safe fallback and render detail-only section with JP/EN labels and caution text.
4. Add minimal CSS for stroke section with mobile-safe layout.
5. Add validation script for stroke-counts consistency with dict.
6. Run requested validation commands and confirm only scoped files changed.

## Manual verification
- Open tool and verify detail panel shows stroke section only for entries in stroke-counts.
- Confirm list cards are unchanged.
- Toggle JP/EN and verify labels/notes switch correctly.
- Temporarily fail stroke-counts fetch and verify app still loads list.
