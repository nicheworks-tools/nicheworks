# ExecPlan — UI Atlas 50-pattern perfection pass

## Scope
- Target only: `tools/ui-atlas/*`
- In-scope files:
  - `tools/ui-atlas/data/patterns.free.v1.json`
  - `tools/ui-atlas/app.js`
  - `tools/ui-atlas/styles.css` (only if sample/compare polish requires)
  - `tools/ui-atlas/index.html` / `tools/ui-atlas/ja/index.html` (only if text hooks needed)

## Goals
1. Complete a quality-focused audit of the existing 50 free patterns (no new patterns).
2. Improve per-pattern metadata quality for discoverability and decision-making.
3. Tighten category assignments and similar-pattern links.
4. Improve search relevance via aliases, novice wording, use-case wording, and practical intent phrasing.
5. Upgrade card/detail sample usefulness while keeping the current live-sample renderer.
6. Improve compare output clarity for practical A-vs-B decisions.
7. Verify no regressions across search, filters, detail panel, compare, favorites, recent history, and prompt copy.

## Steps
1. Inspect the current 50-pattern dataset for repeated/weak fields and borderline taxonomy assignments.
2. Apply curated updates across all 50 records (metadata, aliases, similar links, and sample configs).
3. Refine `app.js` sample rendering to better differentiate mini card sample vs richer detail sample.
4. Refine compare rendering wording/structure for clearer choose-A vs choose-B guidance.
5. Run JSON/JS validation and smoke checks.
6. Capture screenshots if screenshot tooling is available; otherwise report limitation explicitly.

## Manual verification for user
- EN/JA catalog loads and renders all 50 cards.
- Mobile starts with detail panel closed; open/close works reliably.
- Compare tray still limits to 2 and outputs actionable recommendations.
- At least 10 patterns clearly show stronger mini+detail sample differentiation.
- Search by novice phrases/aliases returns expected patterns.
