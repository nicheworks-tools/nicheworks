# Old Kanji SEO Wave 3 — 旧 / 舊

## Goal
Publish exactly one additional evidence-backed individual Old Kanji Reference page for `旧 / 舊`, using the same actual-GSC-demand + dictionary-audit + primary-source gate established in Waves 1–2. Do not start bulk or programmatic SEO.

## Demand gate
Source: authenticated Google Search Console property `sc-domain:nicheworks.app`, queried through Supermetrics on 2026-09-17 with finalized results and query filters covering `旧字体|旧字|異体字|Unicode|新字体`.

- `旧 旧字体`: 1 impression in the 180-day extraction (average position 83). This is small but actual observed demand and directly targets a distinct old/new pair.
- `倉 旧字`, `贈 旧字`, `輝 旧字`, `鯨 旧字体`: observed demand exists, but the repository dictionary maps each character to itself, so they are excluded from individual old/new pages.
- `御 旧字体`: excluded as established in Wave 2 because the Agency for Cultural Affairs 常用漢字表 lists `御` without a parenthesized historical form.
- `嶺 旧字` and `禎 旧字`: not authorized in this wave because repository treatment is compatibility-character territory rather than the verified old-to-modern class used for individual pages.

## Dictionary gate
Repository audit after PR8:

- `舊 → 旧`
- classification: `old_to_modern`
- `舊` is present in `seoCandidates`
- zero audit issue records overall and zero conflicting raw duplicate keys.

Repository eligibility alone is not publication approval; the GSC demand above is also required.

## Primary-source gate
The Agency for Cultural Affairs 常用漢字表（平成22年内閣告示第2号）explicitly lists `旧（舊）`. The same table gives `旧道，新旧，復旧` as examples. Its instructions explain that forms in round parentheses are so-called Kangxi Dictionary forms included to show continuity with typefaces used since the Meiji era.

Primary source:
`https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/index.html`
PDF:
`https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/joyokanjihyo_20101130.pdf`

## Scope
Create only:

1. `tools/old-kanji-reference/kanji/kyu-old/index.html`
   - canonical URL: `https://nicheworks.app/tools/old-kanji-reference/kanji/kyu-old/`
   - answer immediately: the old form corresponding to `旧` is `舊`.
   - use restrained examples supported by the Culture Agency table: `旧道 → 舊道`, `新旧 → 新舊`, `復旧 → 復舊`.
   - cite/link the Agency for Cultural Affairs 常用漢字表.
   - link back to Old Kanji Reference and the two existing individual guides.
2. Add one contextual link from the Old Kanji Reference root alongside Waves 1–2.
3. Add the canonical URL once to `sitemap.xml` next to the other individual Old Kanji Reference entries.

No dictionary changes. No second Wave 3 character. No generator/template rollout. No unrelated tool changes.

## Quality / stop conditions
- Do not publish identity mappings as old/new pairs.
- Do not add unsupported history, name-use, legal-use, or Unicode claims.
- Do not infer that every occurrence of modern `旧` should historically be written `舊`; examples are orthographic substitutions for the target character only.
- Preserve existing Old Kanji Reference behavior and bilingual interface.
- Keep unrelated parallel work untouched.

## Validation
- Verify title, description, canonical, robots, OG/Twitter metadata, AdSense, structured data, and internal links.
- Verify the new canonical URL appears once in `sitemap.xml`.
- Run repository CI without weakening or bypassing checks.
- Re-read latest `main` and re-check mergeability immediately before merge.
- Squash merge only if required checks pass and no conflict is present.
