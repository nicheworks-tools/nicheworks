# Old Kanji SEO Wave 2 — 将 / 將

## Goal
Publish exactly one additional evidence-backed individual Old Kanji Reference page for `将 / 將`, using the same demand + dictionary + primary-source gate established in Wave 1. Do not start bulk or programmatic SEO.

## Demand gate
Source: authenticated Google Search Console property `sc-domain:nicheworks.app`, queried through Supermetrics on 2026-09-17 using finalized data and filters covering `旧字体|旧字|異体字|Unicode|新字体`.

- `将 旧字体`: 1 impression in the 180-day extraction and 1 impression in the latest 30-day extraction, average position 2 in both observed rows.
- `御 旧字体`: 3 impressions in the latest 30 days but excluded because authoritative evidence does not establish a distinct old-form pair. The Agency for Cultural Affairs 常用漢字索引 lists `御` without a parenthesized historical form, unlike entries such as `峡（峽）`.
- `魂 旧字体` and `霧 旧字体`: excluded because repository audit classifies them as identity mappings.
- `倉 旧字`, `贈 旧字`, `輝 旧字`, `鯨 旧字体`: demand exists at one impression each, but no individual page is authorized in this wave without the same old-to-modern evidence gate.

## Dictionary gate
Repository audit after PR8:

- `將 → 将`
- classification: `old_to_modern`
- `seoCandidate: true`
- zero audit issue records overall and zero conflicting raw duplicate keys.

Repository eligibility alone is not publication approval; observed GSC demand is also required.

## Primary-source gate
The Agency for Cultural Affairs 常用漢字表 explicitly lists `将（將）`. This is the factual basis for the page. Kanjipedia independently labels `將` as the old form of `将`, but the Culture Agency is the primary authority used for publication copy.

## Scope

Create only:

1. `tools/old-kanji-reference/kanji/sho-shou/index.html`
   - canonical URL: `https://nicheworks.app/tools/old-kanji-reference/kanji/sho-shou/`
   - answer immediately: the old form of `将` is `將`.
   - include restrained examples that change only the target character, e.g. `将棋 → 將棋`, `大将 → 大將`.
   - cite/link the Agency for Cultural Affairs 常用漢字表.
   - link back to Old Kanji Reference and the existing `画 / 畫` page.
2. Add one contextual link from the Old Kanji Reference root alongside the existing Wave 1 guide.
3. Add the canonical URL once to `sitemap.xml` next to the Old Kanji Reference individual page entry.

No dictionary changes. No second Wave 2 character. No generator/template rollout. No unrelated tool changes.

## Quality / stop conditions

- Do not publish a page for `御` merely because query demand is larger.
- Do not describe identity mappings as old/new pairs.
- Do not add unsupported history, name-use, legal-use, or Unicode claims.
- Preserve existing Old Kanji Reference behavior and bilingual interface.
- Keep all unrelated parallel work untouched.

## Validation

- Verify title, description, canonical, robots, OG/Twitter metadata, AdSense, structured data, and internal links.
- Verify the new canonical URL appears once in `sitemap.xml`.
- Run repository CI without weakening or bypassing checks.
- Re-read latest `main` and re-check mergeability immediately before merge.
- Squash merge only if required checks pass and no conflict is present.
