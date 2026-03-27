# ExecPlan — Vibe Lexicon mobile compression release pass

## Scope
- `tools/vibe-lexicon/index.html`
- `tools/vibe-lexicon/ja/index.html`
- `tools/vibe-lexicon/styles.css`
- `tools/vibe-lexicon/app.js`

## Files to touch
- EN/JA markup updates for compact mobile filter controls, compare discoverability affordance, and quieter ad placeholders.
- Shared CSS updates for mobile compression of filter/detail/card/favorites/compare UI while preserving desktop behavior.
- Shared app behavior updates for filter section expand/collapse and mobile compare status bar wiring.

## High-level steps
1. Compress mobile filter sheet with expandable chip sections (especially use case).
2. Compress mobile detail header and action footprint.
3. Compress mobile result card spacing while preserving content readability.
4. Rebuild mobile favorites/recent rows to reduce button dominance.
5. Add non-intrusive compare discoverability affordance on mobile.
6. Refine ad placeholder to neutral production-safe appearance.
7. Run regression checks for JS parsing and preserved runtime features.

## Manual verification steps
- On mobile width, first screen reaches catalog quickly and filters are compact by default.
- Filter sheet opens and use-case chips can expand/collapse.
- Opening any term shows detail sheet with practical content visible earlier.
- Favorites/recent rows are compact and still open/clear correctly.
- Compare status affordance appears when compare count > 0 and jumps to compare tray.
- EN/JA parity confirmed for mobile detail and filter behavior.
