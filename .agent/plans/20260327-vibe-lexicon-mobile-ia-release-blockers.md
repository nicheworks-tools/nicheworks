# ExecPlan — Vibe Lexicon mobile IA release blockers

## Scope
- `tools/vibe-lexicon/index.html`
- `tools/vibe-lexicon/ja/index.html`
- `tools/vibe-lexicon/styles.css`
- `tools/vibe-lexicon/app.js`

## Files to touch
- EN/JA index templates for mobile filter/detail controls and ad placeholder treatment.
- Shared CSS for mobile IA behavior (filter drawer, detail sheet, favorites/recent rows, compare tray spacing).
- Shared app logic for mobile open/close state and preserving feature behavior.

## High-level steps
1. Inspect existing EN/JA structure and shared JS/CSS behavior to identify mobile blockers.
2. Add mobile-first filter entry pattern (drawer/sheet) without changing desktop layout behavior.
3. Add mobile detail overlay pattern so term detail opens immediately from cards/rows.
4. Refactor favorites/recent row markup and styling for compact, intentional mobile action layout.
5. Replace raw ad placeholder treatment with neutral low-emphasis placeholder style.
6. Improve compare tray mobile spacing/readability while preserving free compare cap of 2.
7. Run regression checks for syntax and key behavior paths (search/filter/detail/compare/favorites/recent/prompt copy).

## Manual verification steps
- Mobile viewport first load reaches catalog quickly; filters are behind an explicit action.
- Mobile filter sheet opens/closes and filters still apply.
- Opening a term from card/favorites/recent shows detail in mobile overlay immediately.
- Favorites/recent rows look compact and usable on mobile; actions are not oversized.
- Compare tray remains max 2 and is readable on mobile.
- EN/JA parity check for filter and detail interactions.
