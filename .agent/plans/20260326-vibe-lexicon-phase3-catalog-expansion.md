# ExecPlan — Vibe Lexicon Phase 3 Catalog Expansion

## Scope
- Target directory: `tools/vibe-lexicon/`
- Primary files:
  - `tools/vibe-lexicon/data/terms.js`
  - (Optional proof note) `tools/vibe-lexicon/docs/vibe-lexicon-phase3-proof.md`
- No changes outside target scope.

## Objectives
1. Expand free catalog from 14 terms to 30–40 high-value terms.
2. Keep EN root + JA `/ja/` parity by filling full bilingual content for each new term.
3. Preserve current app behavior and layout (search/filter/detail/compare/favorites/recent/prompt copy).
4. Strengthen compare usefulness with decision-helpful relationships and guides.
5. Provide proof artifacts (before/after counts, added terms list, examples for search and compare).

## Steps
1. Inspect current term schema and existing IDs/coverage.
2. Add ~20 high-value terms across style/readability/CTA/layout/form/mobile groups with complete required fields.
3. Add compare relationships and compare guides to keep pair insights practical.
4. Validate data integrity with a Node script (count, required field presence, relationship references).
5. Add a phase-3 proof document with required evidence.
6. Run final checks and prepare commit + PR message.

## Manual verification for reviewer
1. Open `/tools/vibe-lexicon/` and `/tools/vibe-lexicon/ja/`.
2. Search using vague phrasing examples from proof doc and confirm useful matches.
3. Select two suggested compare pairs and confirm insight panel is practical.
4. Open detail on desktop and mobile widths to confirm no layout/function regressions.
