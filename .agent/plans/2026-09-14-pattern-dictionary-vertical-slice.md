# ExecPlan — Pattern Dictionary vertical slice

## Goal

Implement the first repository-backed vertical slice of the NicheWorks Pattern Dictionary under `tools/pattern-dictionary/` so the product can be validated with real static pages, client-side fuzzy/visual search, bilingual detail pages, visual filtering, and comparison before expanding the dataset to 100 patterns.

## Base

- Synced main SHA: `d5e8d861d35255c2ccf1ad36e102acd7dfef45bc`
- Branch: `feat/pattern-dictionary-vertical-slice-20260914`
- Repository: `nicheworks-tools/nicheworks`
- Target: `tools/pattern-dictionary/`

## Scope

- Add the static tool at `tools/pattern-dictionary/` with a 20-pattern prototype dataset.
- Implement JA/EN top pages, client-side ambiguous search, Visual Autocomplete, interpretation chips, visual filters, related/confusable navigation, comparison, and static JA/EN detail URLs.
- Keep DEV imagery visibly marked; do not represent prototype data/images as verified production references.
- Register the public tool in `tools/tools-index.json`, `tools/tools-meta.json`, and `sitemap.xml`.
- Extend canonical registered-tool contracts from 89 to 90: per-tool SPEC manifest/coverage, quality matrix, and monetization classification.
- Follow the existing publishing-mode audit unchanged; its expected count is derived from `tools/tool-spec-manifest.json`.

## Files to touch

- `.agent/plans/2026-09-14-pattern-dictionary-vertical-slice.md`
- `tools/pattern-dictionary/**`
- `docs/tools/pattern-dictionary.md`
- `tools/tools-index.json`
- `tools/tool-spec-manifest.json`
- `tools/tools-meta.json`
- `audits/tool-quality-matrix.json`
- `MONETIZATION_CLASSIFICATION_87.json`
- `sitemap.xml`

No other persistent product files are in scope for this vertical slice.

## Non-goals

- Do not modify `common-spec/`.
- Do not modify existing tools, including `tools/pattern-atlas/`.
- Do not add live Amazon affiliate URLs yet.
- Do not claim prototype-curated pattern facts are source-verified.
- Do not generate or publish the remaining 80 production patterns in this change.
- Do not alter deployment settings or weaken/bypass repository audits.

## Implementation steps

1. Canonical 20-pattern JSON data with stable IDs, bilingual names/search vocabulary, color policy, relationships, and review/image state. **Implemented.**
2. Shared CSS/JS for rendering, search, filters, autocomplete, and compare. **Implemented.**
3. JA/EN top/search pages and 20 JA + 20 EN static detail URLs. **Implemented.**
4. Micro-pattern filter visuals and visibly marked DEV placeholders. **Implemented.**
5. Structural/search validation scripts. **Implemented.**
6. Register the public landing and synchronize 90-tool repository contracts. **Implemented and repository contracts pass at 90/90.**
7. Standardize tool-local and canonical docs to the 15-section SPEC contract. **Implemented.**
8. Run repository audits and browser QA. **Repository audits pass. Browser QA found and fixed a houndstooth ranking weakness and a nonexistent `/assets/nw-base.css` reference; final four-viewport rerun remains before ready-for-review.**

## Current validation evidence

- Search smoke: 10/10 expectations pass; the ambiguous JA `白黒のギザギザしたチェック` and EN `black white jagged check` cases are locked to Houndstooth as Top1 regressions.
- `node --check` passes for the static-URL `app.js` implementation.
- Static JA/EN detail directories exist for all 20 prototype IDs; legacy query detail pages were removed.
- All 40 detail pages remain `noindex,follow` until source/image verification.
- JA/EN top pages are the only Pattern Dictionary pages intended to be indexable in this slice; search/compare pages are `noindex,follow`.
- Tool specification contract passes at 90 registered / 90 complete / 0 pending.
- Canonical tool spec coverage passes at 90 registered / 90 specifications.
- Tool quality contract passes with 90 records: PASS=90 / FIX=0 / BLOCKED=0 / NEEDS_DECISION=0.
- Common support and monetization denominator contracts are synchronized to 90 tools.
- SEO audit and Tool runtime contract audit pass.
- Tool-local and canonical 15-section SPEC documents are present.
- Monetization classification is `AFFILIATE`; live affiliate URLs remain disabled.
- Publishing-mode audit itself does not need modification because it reads the manifest's `required_complete` value.

## Browser verification still required

- Final automated rerun at desktop 1200px, tablet 768px, mobile 390px and 320px after the broken stylesheet reference cleanup.
- Verify visual grid, autocomplete, ambiguous JA/EN search, interpretation-chip reranking, same-ID language switching, comparison, and no horizontal overflow.
- Verify no user search text leaves the browser.
- Verify zero broken local HTTP references and zero page-level JavaScript exceptions.

## Acceptance

- [x] 20 canonical prototype records have unique IDs and required color/review fields.
- [x] JA and EN top/search/static-detail flows are implemented.
- [x] Search, browse, autocomplete, visual filters, relationships, and compare are implemented.
- [x] Standard 15-section tool-local and canonical SPEC coverage exists.
- [x] Public registration and all 90-tool repository contracts pass.
- [ ] Full repository validator/browser QA passes with zero broken local references.
- [x] DEV placeholders are visibly marked and not represented as production-verified dictionary images.
- [x] No live affiliate URLs are introduced in this slice.
