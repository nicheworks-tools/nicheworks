# ExecPlan — Pattern Dictionary vertical slice

## Goal

Implement the first repository-backed vertical slice of the NicheWorks Pattern Dictionary under `tools/pattern-dictionary/` so the product can be validated with real static pages, client-side fuzzy/visual search, bilingual detail pages, visual filtering, and comparison before expanding the dataset to 100 patterns.

## Base

- Synced main SHA: `d5e8d861d35255c2ccf1ad36e102acd7dfef45bc`
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
- Register the public tool landing in `tools/tools-index.json` and `sitemap.xml`.
- Extend the repository's canonical 89-tool contracts to 90 without weakening any validation logic: per-tool SPEC manifest/coverage, quality matrix, monetization classification, and the fixed canonical publication count.

## Files to touch

- `.agent/plans/2026-09-14-pattern-dictionary-vertical-slice.md`
- `tools/pattern-dictionary/**`
- `docs/tools/pattern-dictionary.md`
- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- `audits/tool-quality-matrix.json`
- `MONETIZATION_CLASSIFICATION_87.json`
- `scripts/audit-publishing-mode.mjs` — canonical count only (`89` → `90`), no rule/logic relaxation
- `sitemap.xml`

No other files are in scope for this vertical slice.

## Non-goals

- Do not modify `common-spec/`.
- Do not modify existing tools, including `tools/pattern-atlas/`.
- Do not add live Amazon affiliate URLs yet.
- Do not claim prototype-curated pattern facts are source-verified.
- Do not generate or publish the remaining 80 production patterns in this change.
- Do not alter Cloudflare deployment configuration.
- Do not weaken or bypass repository audits; only synchronize canonical manifests/counts required by the new registered tool.

## Implementation steps

1. Establish canonical 20-pattern JSON data with stable IDs, bilingual names/search vocabulary, color policy, relationships, and review/image state. **Implemented.**
2. Implement shared CSS and JS modules for rendering/search/filter/compare behavior. **Implemented.**
3. Implement JA/EN top pages and search result pages. **Implemented.**
4. Generate JA/EN static pattern detail URLs from the canonical IDs. **Implemented: 20 JA + 20 EN.**
5. Add deterministic micro-pattern/filter visuals and visibly marked DEV pattern placeholders. **Implemented.**
6. Add structural/search/link validation scripts that require no third-party packages. **Implemented; static-page checks added.**
7. Register the public landing and satisfy repository publication contracts. **In progress: tools-index/sitemap added; canonical 90-tool manifests still being synchronized.**
8. Convert Pattern Dictionary's tool-local and canonical docs into the standard 15-section per-tool SPEC contract. **In progress.**
9. Run repository audits and browser smoke checks. **Search smoke and JS syntax checks run locally; browser QA remains before ready-for-review.**

## Current validation evidence

- Search smoke set: 9/9 queries include the expected pattern in Top3.
- `node --check` passes for the same static-URL `app.js` implementation.
- GitHub branch contains canonical static JA/EN detail directories for all 20 prototype IDs.
- Legacy query detail pages have been removed.
- Static detail pages remain `noindex,follow` until data/image verification.
- JA/EN top pages are the only Pattern Dictionary pages intended to be indexable in this slice; query-dependent search/compare pages are `noindex,follow`.
- Tool runtime contract audit passes after registration.
- Current Tool spec audit failure is because `pattern-dictionary` is not yet in `tools/tool-spec-manifest.json`.
- Current SEO audit failure is the canonical publication count still fixed at 89 while the registry is now 90.

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

- [x] 20 canonical prototype records have unique IDs and required color/review fields.
- [x] JA and EN top/search/static-detail flows are implemented.
- [x] Search and browse both provide discovery paths.
- [x] Visual autocomplete and micro-pattern visual filters are implemented.
- [x] Similar/commonly-confused relationships render from canonical data.
- [x] Compare supports two patterns.
- [ ] Public tool registration and all 90-tool repository contracts pass.
- [ ] Full repository validator/browser QA passes with zero broken local references.
- [x] DEV placeholders are visibly marked and not represented as production-verified dictionary images.
- [x] No live affiliate URLs are introduced in this slice.
