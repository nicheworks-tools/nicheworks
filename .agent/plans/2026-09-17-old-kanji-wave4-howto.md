# Old Kanji SEO Wave 4 — 旧字体の調べ方

## Goal
Improve the existing Japanese Old Kanji Reference how-to page for an actual Google Search Console intent instead of forcing another individual-character page after the safe individual demand pool is exhausted.

## Demand gate
Authenticated Google Search Console property `sc-domain:nicheworks.app`, queried through Supermetrics on 2026-09-17 with finalized data for 2026-03-21 through 2026-09-16:

- `旧字体 調べ 方`: 5 impressions, 1 click, average position 28.8, currently landing on `/tools/old-kanji-reference/`.
- `旧字体 調べ方`: 4 impressions, 0 clicks, average position 45.75, currently landing on `/tools/old-kanji-reference/`.
- Existing `/tools/old-kanji-reference/howto/` returned no query/page rows for the same 180-day period.

This gives a combined observed intent of 9 impressions that is currently handled by the tool root rather than the dedicated guide.

## Why not another character page
The remaining character-specific GSC rows were checked against the repository dictionary:

- `輯 旧 字`: `輯 → 輯` identity mapping.
- `倉 旧字`: `倉 → 倉` identity mapping.
- `贈 旧字`: `贈 → 贈` identity mapping.
- `輝 旧字`: `輝 → 輝` identity mapping.
- `鯨 旧字体`: `鯨 → 鯨` identity mapping.
- `所`, `片`, `菜`, `辰` do not establish an audited old-to-modern pair for this publication gate.
- `嶺` and `禎` remain compatibility-character territory, not the verified `old_to_modern` class used for individual pages.
- `御` remains excluded for the primary-source reason recorded in Wave 2.

Do not create an individual page merely to keep the wave count moving.

## Scope
1. Rewrite the existing Japanese how-to page at `tools/old-kanji-reference/howto/index.html` around the literal search intent `旧字体の調べ方`.
2. Keep the page practical and tied to current product behavior:
   - search by modern or old character in Old Kanji Reference;
   - use Old Kanji OCR Scanner when the character exists only in an image or photographed paper;
   - use Kanji Modernizer when the user wants to convert a whole text rather than identify one character.
3. Add a prominent contextual link from the Old Kanji Reference root to the how-to page.
4. Update only the existing how-to URL's `lastmod` in `sitemap.xml`.
5. Do not modify the dictionary, individual character pages, English how-to page, or unrelated tools.

## SEO/content constraints
- Title and H1 must directly say `旧字体の調べ方`.
- Explain the fastest method before secondary cases.
- Do not claim handwriting recognition exists inside Old Kanji Reference.
- Do not imply a candidate is legally authoritative for a registry or official filing; users must follow the receiving authority for official documents.
- Do not add unsupported historical claims.
- Keep canonical URL unchanged.

## Validation
- Preserve canonical, hreflang, robots, AdSense, GA, OG/Twitter metadata and structured data.
- Verify all relative links resolve from `/tools/old-kanji-reference/howto/`.
- Confirm root has exactly one new contextual how-to link.
- Confirm sitemap has the same how-to URL exactly once with `lastmod=2026-09-17`.
- Run repository CI without weakening checks.
- Re-read latest `main` and PR mergeability immediately before squash merge.