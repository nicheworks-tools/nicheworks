# ExecPlan — Pattern Dictionary vertical slice

## Goal

Implement the first repository-backed vertical slice of the NicheWorks Pattern Dictionary under `tools/pattern-dictionary/` so the product can be validated with real static pages, client-side fuzzy/visual search, bilingual detail pages, visual filtering, and comparison before expanding the dataset to 100 patterns.

## Base

- Base main SHA: `785e653628e44e46090e15b0711b65a2b2593c25`
- Branch: `feat/pattern-dictionary-vertical-slice-20260914`
- Repository: `nicheworks-tools/nicheworks`
- Target: `tools/pattern-dictionary/`

## Scope

- Add a new static tool at `tools/pattern-dictionary/`.
- Add a 20-pattern prototype dataset derived from the approved working master.
- Implement JA/EN top pages.
- Implement client-side ambiguous search, visual autocomplete, search interpretation chips, filters, similar-pattern navigation, and 2-pattern comparison.
- Add per-pattern JA/EN static detail URLs from the canonical JSON data.
- Add deterministic visual placeholder assets for patterns that do not yet have verified production PNGs.
- Clearly mark all placeholder/reference status in data and documentation.
- Follow NicheWorks common layout, analytics, ad-slot, donation, SEO, responsive, privacy and internal-link rules where applicable.

## Files to touch

- `.agent/plans/2026-09-14-pattern-dictionary-vertical-slice.md`
- `tools/pattern-dictionary/**`

No other files are in scope for this first vertical slice.

## Non-goals

- Do not modify `common-spec/`.
- Do not modify existing tools.
- Do not add the prototype to the mother-site tool index or sitemap yet.
- Do not add live Amazon affiliate URLs yet.
- Do not claim prototype-curated pattern facts are source-verified.
- Do not generate or publish the remaining 80 production patterns in this change.
- Do not alter Cloudflare deployment configuration or CI.

## Implementation steps

1. Establish canonical 20-pattern JSON data with stable IDs, bilingual names/search vocabulary, color policy, relationships, and review/image state. **Implemented.**
2. Implement shared CSS and JS modules for rendering/search/filter/compare behavior. **Implemented.**
3. Implement JA/EN top pages and search result pages. **Implemented.**
4. Generate JA/EN static pattern detail URLs from the canonical IDs. **Implemented: 20 JA + 20 EN.**
5. Add deterministic micro-pattern/filter visuals and visibly marked DEV pattern placeholders. **Implemented.**
6. Add structural/search/link validation scripts that require no third-party packages. **Implemented; static-page checks added.**
7. Run validators and browser smoke checks. **Search smoke and JS syntax checks run locally; repository checkout/browser QA remains before ready-for-review.**

## Current validation evidence

- Search smoke set: 9/9 queries include the expected pattern in Top3.
- `node --check` passes for the same static-URL `app.js` implementation.
- GitHub branch contains canonical static JA/EN detail directories for all 20 prototype IDs.
- Legacy query detail pages have been removed.
- Static detail pages remain `noindex,follow` until data/image verification.

## Manual verification still required

- Desktop: 1200px wide.
- Tablet: 768px wide.
- Mobile: 390px and 320px wide.
- Verify top grid remains visually scannable.
- Verify visual autocomplete returns image-backed suggestions.
- Verify ambiguous JA and EN queries rank expected patterns.
- Verify interpretation chips can remove search cues and rerank.
- Verify detail-page language switching preserves the same pattern ID.
- Verify compare works with two selected patterns and remains readable on mobile.
- Verify no user search text leaves the browser.

## Acceptance

- [x] Tool is fully contained under `tools/pattern-dictionary/` plus this ExecPlan.
- [x] 20 canonical prototype records have unique IDs and required color/review fields.
- [x] JA and EN top/search/static-detail flows are implemented.
- [x] Search and browse both provide discovery paths.
- [x] Visual autocomplete and micro-pattern visual filters are implemented.
- [x] Similar/commonly-confused relationships render from canonical data.
- [x] Compare supports two patterns.
- [ ] Full repository validator/browser QA passes with zero broken local references.
- [x] DEV placeholders are visibly marked and not represented as production-verified dictionary images.
- [x] No live affiliate URLs are introduced in this slice.
